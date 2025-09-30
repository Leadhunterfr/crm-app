import { google } from "googleapis";

export default async function handler(req, res) {
  const { code } = req.query;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
  );

  const { tokens } = await oauth2Client.getToken(code);

  // ⚡️ Ici → stocker tokens en DB (supabase) liés à l’utilisateur
  // tokens.access_token, tokens.refresh_token

  res.redirect("/settings?mail=connected");
}
