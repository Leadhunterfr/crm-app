// pages/api/invitations/accept.js
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token, full_name, password } = req.body;

    try {
      // Vérifier l’invitation
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", token)
        .eq("accepted", false)
        .single();

      if (inviteError || !invitation) {
        return res.status(400).json({ message: "Invitation invalide ou déjà utilisée." });
      }

      // Créer l’utilisateur dans Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
      });

      if (authError) throw authError;

      // Créer son profil lié à l’org
      const { error: profileError } = await supabase.from("user_profiles").insert([{
        id: authUser.user.id,
        full_name,
        email: invitation.email,
        role: invitation.role,
        org_id: invitation.org_id,
      }]);

      if (profileError) throw profileError;

      // Marquer l’invitation comme acceptée
      await supabase.from("invitations").update({ accepted: true }).eq("id", token);

      return res.status(200).json({ message: "Invitation acceptée. Compte créé." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
