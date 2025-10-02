import { google } from "googleapis";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  try {
    const supabase = createServerSupabaseClient({ req, res });

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
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) return res.status(401).send("Non authentifié");

    // Sauvegarde tokens dans la table user_profiles
    const { error } = await supabase
      .from("user_profiles")
      .update({
        google_connected: true,
        mail_access_token: tokens.access_token,
        mail_refresh_token: tokens.refresh_token, // ⚠️ peut être null si Google ne le renvoie pas
        mail_token_expiry: tokens.expiry_date, // optionnel si tu veux tracker l’expiration
      })
      .eq("id", user.id);

    if (error) throw error;

    res.redirect("/settings?google=success");
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect("/settings?google=error");
  }
}
