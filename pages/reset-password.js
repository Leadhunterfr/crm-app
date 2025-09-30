import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    if (error) return setMessage(error.message);
    setMessage("Email de réinitialisation envoyé !");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleReset} className="bg-white p-6 rounded-lg shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold">Réinitialiser mot de passe</h1>
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Envoyer</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
