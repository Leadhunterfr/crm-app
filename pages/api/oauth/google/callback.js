// pages/api/oauth/google/callback.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
    );

    const { code } = req.query;

    // Échange le code contre un access_token + refresh_token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Ici tu peux sauvegarder les tokens en BDD (liés à l’utilisateur)
    // Exemple: refresh_token dans ta table user_profiles
    // await supabase.from("user_profiles").update({ google_refresh_token: tokens.refresh_token }).eq("id", user.id)

    return res.redirect("/settings?google=connected");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur OAuth Google");
  }
}
