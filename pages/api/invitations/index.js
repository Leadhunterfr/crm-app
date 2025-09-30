// pages/api/invitations/index.js
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, role = "user", org_id, invited_by } = req.body;

    try {
      // Vérifier si l’utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        return res.status(400).json({ message: "Cet utilisateur existe déjà." });
      }

      // Créer l’invitation
      const { data, error } = await supabase
        .from("invitations")
        .insert([{ email, role, org_id, invited_by }])
        .select()
        .single();

      if (error) throw error;

      // TODO: ici tu pourras envoyer un vrai email avec le lien d’invitation
      // Exemple de lien d’acceptation : `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${data.id}`

      return res.status(200).json({ invitation: data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
