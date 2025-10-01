// pages/api/user/me.js
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    // Récupérer les infos dans user_profiles
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return res.status(200).json({ user: { ...data, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur ❌" });
  }
}
