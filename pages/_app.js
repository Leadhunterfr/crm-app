import "@/styles/globals.css";
import Layout from "@/components/Layout";

export default function MyApp({ Component, pageProps }) {
  // Si une page veut désactiver le layout, on check une propriété spéciale
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return getLayout(<Component {...pageProps} />);
}
