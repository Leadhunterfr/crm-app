// pages/api/admin/invite-user.js
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email requis" });
  }

  try {
    // Récupérer profil admin
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé" });
    }

    // Insérer une invitation
    const { data: invite, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        email,
        org_id: profile.org_id,
        role: "user",
        invited_by: user.id,
        accepted: false,
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // Générer un lien vers la page accept-invite
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?id=${invite.id}`;

    // 💡 Ici on simplifie : on retourne juste le lien
    return res.status(200).json({
      message: "Invitation créée ✅",
      link: inviteLink,
    });
  } catch (err) {
    console.error("Erreur invite-user:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
