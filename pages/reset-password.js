// pages/reset-password.js
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Lock } from "lucide-react";
import { useRouter } from "next/router";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Quand l’utilisateur clique depuis l’email, Supabase met la session en localStorage
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Session de récupération active");
      }
    });
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("Mot de passe mis à jour ! Redirection...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
          Réinitialiser le mot de passe
        </h1>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
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
            {loading ? "Mise à jour..." : "Réinitialiser"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        {message && <p className="text-green-600 text-sm mt-3">{message}</p>}
      </div>
    </div>
  );
}
