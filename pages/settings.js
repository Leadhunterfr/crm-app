import React, { useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react"; // si tu utilises next-auth
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // si tu as un composant switch
import { SignOut, Mail, Key } from "lucide-react";
import { Core } from "@/integrations/Core"; // ou fonctions OAuth que tu vas créer

export default function SettingsPage({ userData }) {
  // userData pourrait être chargé via getServerSideProps ou fetch dans useEffect
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [telephone, setTelephone] = useState(userData?.telephone || "");
  const [department, setDepartment] = useState(userData?.department || "");
  const [darkMode, setDarkMode] = useState(userData?.darkMode || false);
  const [isAdmin, setIsAdmin] = useState(userData?.role === "admin");

  const [mailConnected, setMailConnected] = useState(false);
  const [mailAddress, setMailAddress] = useState("");

  const handleSaveProfile = async () => {
    // appelle ton API pour sauvegarder le profil
    console.log("Sauvegarde profil", { fullName, email, telephone, department, darkMode });
    // Exemple : await fetch("/api/user/update", { method: "POST", body: JSON.stringify(...) });
  };

  const handlePasswordReset = async () => {
    // appelle ton API backend pour envoyer email de réinitialisation de mot de passe
    console.log("Envoi lien réinitialisation mot de passe pour", email);
  };

  const handleConnectGmail = async () => {
    // redirige vers l’URL OAuth Gmail / backend
    // Exemple : window.location.href = "/api/oauth/google";
    console.log("Connecter Gmail");
  };

  const handleConnectOutlook = async () => {
    console.log("Connecter Outlook");
  };

  return (
    <div className="p-6 bg-slate-100 dark:bg-slate-900 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="darkMode">Mode sombre</Label>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={(val) => setDarkMode(val)}
              />
            </div>
            <div className="pt-4">
              <Button onClick={handleSaveProfile}>Enregistrer</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Cliquez ci-dessous pour réinitialiser votre mot de passe.</p>
            <Button onClick={handlePasswordReset} variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Réinitialiser le mot de passe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connexion boîte mail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mailConnected ? (
              <p>Connecté à : {mailAddress}</p>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button onClick={handleConnectGmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Connecter Gmail
                </Button>
                <Button onClick={handleConnectOutlook}>
                  <Mail className="w-4 h-4 mr-2" />
                  Connecter Outlook
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Administration</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ici, l’admin peut gérer les utilisateurs, rôles, etc.</p>
              {/* Tu peux ajouter des liens vers les pages admin */}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Si tu veux précharger les données utilisateur (profil, rôle, etc.)
export async function getServerSideProps(context) {
  // Remplace ça par ton backend ou auth
  const userData = {
    fullName: "Lead Hunter",
    email: "leadhunterfr@gmail.com",
    telephone: "",
    department: "",
    darkMode: false,
    role: "admin",
  };

  return {
    props: { userData },
  };
}
