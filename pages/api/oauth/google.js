// pages/api/oauth/google.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
    );

    // On force Google à redonner un refresh_token
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", 
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
      ],
    });

    res.redirect(url);
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).json({ error: "Erreur OAuth Google" });
  }
}
