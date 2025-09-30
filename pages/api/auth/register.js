import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, fullName, companyId } = req.body;

  // Vérifier nombre d’utilisateurs max
  const { data: users, error: countError } = await supabase
    .from("users")
    .select("id", { count: "exact" })
    .eq("company_id", companyId);

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (users.length >= company.max_seats) {
    return res.status(400).json({ error: "Nombre maximum de sièges atteint" });
  }

  // Créer utilisateur
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, company_id: companyId } },
  });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ success: true, user: data.user });
}
