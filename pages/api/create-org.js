import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    // 🔑 Récupérer le token JWT envoyé depuis le client
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Non authentifié" });

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // 🔑 Vérifier rôle dans user_profiles
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileErr) throw profileErr;
    if (!profile || profile.role !== "superadmin") {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // ---- Création organisation + admin ----
    const { email, seats, orgName } = req.body;
    if (!email || !seats) {
      return res.status(400).json({ error: "Email et nombre de sièges requis" });
    }

    const { data: org, error: orgErr } = await supabaseAdmin
      .from("organisations")
      .insert([{ name: orgName || email.split("@")[0], seats }])
      .select()
      .single();
    if (orgErr) throw orgErr;

    const { data: userCreated, error: userErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
      });
    if (userErr) throw userErr;

    const { error: memberErr } = await supabaseAdmin
      .from("organisation_members")
      .insert([
        {
          org_id: org.id,
          user_id: userCreated.user.id,
          email: userCreated.user.email,
          role: "admin",
          joined_at: new Date(),
        },
      ]);
    if (memberErr) throw memberErr;

    return res.status(200).json({ success: true, org, admin: userCreated.user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
