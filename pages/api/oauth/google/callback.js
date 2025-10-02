// pages/api/oauth/google/callback.js
import { google } from "googleapis";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const userId = req.query.state; // 🔑 récupéré depuis l'URL de retour Google

    if (!code || !userId) {
      return res.status(400).send("Missing code or state");
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
    );

    // 🔑 Récupération des tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Connexion à Supabase
    const supabase = createServerSupabaseClient({ req, res });

    // Mise à jour du profil avec les tokens Google
    const { error } = await supabase
      .from("user_profiles")
      .update({
        google_connected: true,
        mail_access_token: tokens.access_token || null,
        mail_refresh_token: tokens.refresh_token || null, // peut être null si Google ne le renvoie pas
        mail_token_expiry: tokens.expiry_date || null,
      })
      .eq("id", userId);

    if (error) throw error;

    console.log("✅ Tokens enregistrés pour user", userId);

    // Redirection vers les settings
    res.redirect("/settings?google=success");
  } catch (err) {
    console.error("❌ Google OAuth error:", err);
    res.redirect("/settings?google=error");
  }
}
