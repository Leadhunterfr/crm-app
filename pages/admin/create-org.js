// /pages/admin/create-org.js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

export default function CreateOrgPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Vérifier rôle au chargement
  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "superadmin") {
        setAuthorized(true);
      } else {
        router.push("/"); // accès refusé
      }
      setLoading(false);
    };

    checkRole();
  }, [router]);

  if (loading) return <p className="p-6">Vérification en cours...</p>;
  if (!authorized) return null;


  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer une organisation</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email admin</label>
          <input
            type="email"
            className="border px-3 py-2 rounded w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Nom de l’organisation</label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="(Optionnel, sinon basé sur l'email)"
          />
        </div>

        <div>
          <label className="block font-medium">Nombre de sièges</label>
          <input
            type="number"
            className="border px-3 py-2 rounded w-full"
            value={seats}
            min={1}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 p-4 rounded ${
            result.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {result.success ? (
            <pre className="text-sm">
              ✅ Organisation créée !
              {JSON.stringify(result.data, null, 2)}
            </pre>
          ) : (
            <p>❌ Erreur : {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
