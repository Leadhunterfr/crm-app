// pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Lock, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }, // champs custom (stocké dans "user_metadata")
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // si email confirmation activé
        setSuccess(
          "Compte créé ! Vérifie ta boîte mail pour confirmer ton inscription."
        );
      } else {
        // connexion directe si confirm email désactivé
        router.push("/contacts");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
          Créer un compte
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Nom complet"
              className="w-full pl-10 border rounded-lg p-2 bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 border rounded-lg p-2 bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full pl-10 border rounded-lg p-2 bg-slate-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-sm mt-3 text-center">{success}</p>
        )}

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
            onClick={() => router.push("/login")}
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

// ⛔️ Désactive le Layout (sidebar) pour cette page
RegisterPage.getLayout = (page) => page;

