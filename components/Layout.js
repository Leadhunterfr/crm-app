import Link from "next/link";
import { Users, Shield, Workflow, Home } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed top-0 left-0 h-screen flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">CRM App</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Home className="w-5 h-5" /> Dashboard
          </Link>
          <Link
            href="/contacts"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Users className="w-5 h-5" /> Contacts
          </Link>
          <Link
            href="/pipeline"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Workflow className="w-5 h-5" /> Pipeline
          </Link>
          <Link
            href="/usermanagement"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Shield className="w-5 h-5" /> Utilisateurs
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Shield className="w-5 h-5" /> Réglages
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500">
          © 2025 CRM
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 ml-64 p-6">{children}</main>
    </div>
  );
}
