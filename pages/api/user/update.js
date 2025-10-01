// pages/api/user/update.js
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  try {
    const { fullName, telephone, department, darkMode } = req.body;

    // Vérifier la session utilisateur
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    // Mise à jour du profil
    const { error } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        telephone,
        department,
        darkMode,
      })
      .eq("id", user.id);

    if (error) throw error;

    return res.status(200).json({ message: "Profil mis à jour ✅" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur ❌" });
  }
}
