import "@/styles/globals.css";
import Layout from "@/components/Layout";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

export default function MyApp({ Component, pageProps }) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  // Si une page veut désactiver le layout, on check une propriété spéciale
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      {getLayout(<Component {...pageProps} />)}
    </SessionContextProvider>
  );
}
