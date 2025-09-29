// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login"); // première étape = connexion
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 animate-pulse">
        Chargement...
      </h1>
    </div>
  );
}
