// pages/api/user/me.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  // Récupérer profil
  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileErr) {
    return res.status(500).json({ message: profileErr.message });
  }

  return res.status(200).json({ user: { ...profile, email: user.email } });
}
