// pages/settings.js
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, Key, UserPlus } from "lucide-react";

export default function SettingsPage({ userData }) {
  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [telephone, setTelephone] = useState(userData?.telephone || "");
  const [department, setDepartment] = useState(userData?.department || "");
  const [darkMode, setDarkMode] = useState(userData?.darkMode || false);
  const [isAdmin, setIsAdmin] = useState(userData?.role === "admin");

  const [mailConnected, setMailConnected] = useState(userData?.mailConnected || false);
  const [mailAddress, setMailAddress] = useState(userData?.mailAddress || "");

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, telephone, department, darkMode }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour profil");
      alert("Profil mis à jour ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde ❌");
    }
  };

  const handlePasswordReset = async () => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Erreur envoi reset");
      alert("Email de réinitialisation envoyé ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du mail ❌");
    }
  };

  const handleConnectGmail = () => {
    window.location.href = "/api/oauth/google";
  };

  const handleConnectOutlook = () => {
    window.location.href = "/api/oauth/outlook";
  };

  const handleInviteUser = async () => {
    const inviteEmail = prompt("Email du nouvel utilisateur :");
    if (!inviteEmail) return;
    try {
      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error("Erreur invitation");
      alert("Invitation envoyée ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur envoi invitation ❌");
    }
  };

  return (
    <div className="p-6 bg-slate-100 dark:bg-slate-900 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profil */}
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
              <Input id="email" value={email} disabled />
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

        {/* Mot de passe */}
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

        {/* Connexion boîte mail */}
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

        {/* Admin */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Administration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Gérez vos utilisateurs et licences.</p>
              <Button onClick={handleInviteUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                Inviter un utilisateur
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Simule des données jusqu’à ce qu’on branche Supabase
export async function getServerSideProps() {
  const userData = {
    fullName: "Lead Hunter",
    email: "leadhunterfr@gmail.com",
    telephone: "",
    department: "",
    darkMode: false,
    role: "admin",
    mailConnected: false,
    mailAddress: "",
  };

  return { props: { userData } };
}
