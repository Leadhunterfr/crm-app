import { google } from "googleapis";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  try {
    const supabase = createServerSupabaseClient({ req, res });

    // Récupération du code renvoyé par Google
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Vérif user courant
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return res.status(401).send("Non authentifié");

    // Sauvegarde dans user_profiles
    const { error } = await supabase
      .from("user_profiles")
      .update({
        google_connected: true,
        google_refresh_token: tokens.refresh_token,
      })
      .eq("id", user.id);

    if (error) throw error;

    // Redirige vers settings
    res.redirect("/settings?google=success");
  } catch (err) {
    console.error(err);
    res.redirect("/settings?google=error");
  }
}
