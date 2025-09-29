// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Ici tu mets ton check login (API, Supabase, etc.)
    console.log("Tentative login:", email, password);
    router.push("/contacts"); // après connexion → contacts
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
          Connexion CRM
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
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

          {/* Mot de passe */}
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

          {/* Bouton connexion */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </button>
        </form>

        {/* Lien mot de passe oublié */}
        <div className="text-center mt-4">
          <button className="text-sm text-slate-500 dark:text-slate-400 hover:underline">
            Mot de passe oublié ?
          </button>
        </div>
      </div>
    </div>
  );
}
