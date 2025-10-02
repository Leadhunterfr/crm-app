// pages/api/invitations/accept.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ clé admin uniquement côté serveur
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { token, full_name, password } = req.body;

  if (!token || !full_name || !password) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    // Vérifier l'invitation
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("id", token)
      .eq("accepted", false)
      .single();

    if (inviteError || !invite) {
      return res.status(400).json({ message: "Invitation invalide ou déjà utilisée" });
    }

    // Créer l’utilisateur dans Supabase Auth (avec clé service role)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) throw createError;

    // Créer le profil lié
    const { error: profileError } = await supabaseAdmin.from("user_profiles").insert({
      id: newUser.user.id,
      full_name,
      email: invite.email,
      role: invite.role,
      org_id: invite.org_id,
    });

    if (profileError) throw profileError;

    // Marquer l’invitation comme acceptée
    await supabaseAdmin
      .from("invitations")
      .update({ accepted: true })
      .eq("id", token);

    return res.status(200).json({ message: "Invitation acceptée ✅" });
  } catch (err) {
    console.error("❌ Erreur accept-invite:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
