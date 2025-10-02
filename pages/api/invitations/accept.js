// pages/api/invitations/accept.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚡ clé admin
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
    // 1. Vérifier l'invitation
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("id", token)
      .eq("accepted", false)
      .single();

    if (inviteError || !invite) {
      return res.status(400).json({ message: "Invitation invalide", details: inviteError });
    }

    // 2. Créer l'utilisateur
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true, // ✅ correct
    });

    if (createError) {
      console.error("Erreur createUser:", createError);
      return res.status(500).json({ message: "Erreur création utilisateur", details: createError });
    }

    // 3. Créer le profil
    const { error: profileError } = await supabaseAdmin.from("user_profiles").insert({
      id: newUser.user.id,
      full_name,
      email: invite.email,
      role: invite.role,
      org_id: invite.org_id,
    });

    if (profileError) {
      console.error("Erreur insert profile:", profileError);
      return res.status(500).json({ message: "Erreur création profil", details: profileError });
    }

    // 4. Marquer l’invitation comme acceptée
    await supabaseAdmin.from("invitations").update({ accepted: true }).eq("id", token);

    return res.status(200).json({ message: "Invitation acceptée ✅" });
  } catch (err) {
    console.error("Erreur API accept:", err);
    return res.status(500).json({ message: "Erreur serveur", details: err.message });
  }
}
