import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: "admin" } }
    });
    if (error) return alert(error.message);
    router.push("/contacts");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold">Créer un compte admin</h1>
        <input className="w-full border p-2 rounded" placeholder="Nom complet" value={fullName} onChange={e => setFullName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Créer</button>
      </form>
    </div>
  );
}
