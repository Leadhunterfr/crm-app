import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  try {
    // Vérifier méthode
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Méthode non autorisée" });
    }

    // 1) Récupérer le user courant
    const { data: { user }, error: authErr } = await supabase.auth.getUser(req.headers.authorization?.replace("Bearer ", ""));
    if (authErr || !user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    // 2) Vérifier rôle du user (dans user_profiles)
    const { data: profile, error: profileErr } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr) throw profileErr;
    if (!profile || profile.role !== "superadmin") {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // 3) Inputs (depuis body)
    const { email, seats, orgName } = req.body;
    if (!email || !seats) {
      return res.status(400).json({ error: "Email et nombre de sièges requis" });
    }

    // 4) Créer l’organisation
    const { data: org, error: orgErr } = await supabase
      .from("organisations")
      .insert([{ name: orgName || email.split("@")[0], seats }])
      .select()
      .single();
    if (orgErr) throw orgErr;

    // 5) Créer le compte admin dans Auth
    const { data: userCreated, error: userErr } = await supabase.auth.admin.createUser({
      email,
      password: crypto.randomUUID(),
      email_confirm: true
    });
    if (userErr) throw userErr;

    // 6) Attacher à organisation_members
    const { error: memberErr } = await supabase.from("organisation_members").insert([{
      org_id: org.id,
      user_id: userCreated.user.id,
      email: userCreated.user.email,
      role: "admin",
      joined_at: new Date()
    }]);
    if (memberErr) throw memberErr;

    res.status(200).json({ success: true, org, admin: userCreated.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
