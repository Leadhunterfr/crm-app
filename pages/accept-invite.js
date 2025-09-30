import { useState } from "react";
import { useRouter } from "next/router";

export default function AcceptInvitePage() {
  const router = useRouter();
  const { token } = router.query;
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAccept = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, full_name: fullName, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Invitation acceptée. Redirection...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      setMessage("❌ " + data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleAccept} className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-xl font-bold">Accepter l’invitation</h1>
        <input
          type="text"
          placeholder="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Créer mon compte
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
