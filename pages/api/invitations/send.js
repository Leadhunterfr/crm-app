import { supabase } from "@/lib/supabaseClient";
import { google } from "googleapis";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { invitationId, adminId } = req.body;

  try {
    // 1️⃣ Récupérer l’invitation
    const { data: invitation, error: invError } = await supabase
      .from("invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (invError || !invitation) throw new Error("Invitation introuvable");

    // 2️⃣ Récupérer l’admin + ses tokens mail
    const { data: admin, error: adminError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", adminId)
      .single();

    if (adminError || !admin) throw new Error("Admin introuvable");

    if (!admin.mail_provider || !admin.mail_access_token) {
      throw new Error("L’admin n’a pas connecté sa boîte mail.");
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.id}`;
    const subject = "Invitation à rejoindre le CRM LeadHunter";
    const text = `
      Bonjour,
      
      Vous avez été invité à rejoindre l'organisation ${admin.full_name}.
      Cliquez sur ce lien pour créer votre compte : ${inviteUrl}
      
      L'équipe LeadHunter
    `;

    // 3️⃣ Envoyer via Gmail OAuth2
    if (admin.mail_provider === "google") {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      oAuth2Client.setCredentials({
        access_token: admin.mail_access_token,
        refresh_token: admin.mail_refresh_token,
        expiry_date: admin.mail_token_expires_at,
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: admin.email,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          accessToken: admin.mail_access_token,
          refreshToken: admin.mail_refresh_token,
        },
      });

      await transporter.sendMail({
        from: `${admin.full_name} <${admin.email}>`,
        to: invitation.email,
        subject,
        text,
      });
    }

    // 4️⃣ Envoyer via Outlook OAuth2
    if (admin.mail_provider === "outlook") {
      // même logique mais avec MS Graph API (on pourra le brancher plus tard)
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erreur envoi invitation:", err);
    return res.status(500).json({ message: err.message });
  }
}
