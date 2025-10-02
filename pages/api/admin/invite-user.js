// pages/api/admin/invite-user.js
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // Récupération session via auth-helpers
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  // Récupérer profil
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;
  if (profile.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  // Créer invitation en base
  const { data: invite, error: inviteError } = await supabase
    .from("invitations")
    .insert({
      email,
      org_id: profile.org_id,
      role: "user",
      invited_by: user.id,
    })
    .select()
    .single();

  if (inviteError) throw inviteError;

  // 🚨 Pour l’instant on garde SMTP simple (user+pass)
  // Plus tard tu pourras remplacer par OAuth2 Gmail avec le refresh_token stocké.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // ton email
      pass: process.env.SMTP_PASS, // mot de passe application Gmail
    },
  });

  await transporter.sendMail({
    from: `"CRM App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Invitation à rejoindre l’organisation",
    text: `Vous avez été invité à rejoindre l'organisation sur CRM App.\n\nCliquez ici pour accepter: ${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?id=${invite.id}`,
    html: `<p>Vous avez été invité à rejoindre l'organisation sur <b>CRM App</b>.</p>
           <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?id=${invite.id}">Accepter l'invitation</a></p>`,
  });

  return res.status(200).json({ message: "Invitation envoyée ✅", invite });
}
