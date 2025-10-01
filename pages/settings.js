// pages/settings.js
import React, { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const user = useUser();
  const [userData, setUserData] = useState(null);

  // Met à jour userData quand `user` est dispo
  useEffect(() => {
    if (user) {
      setUserData({
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        telephone: user.user_metadata?.telephone || "",
        department: user.user_metadata?.department || "",
        dark_mode: user.user_metadata?.dark_mode || false,
      });
    }
  }, [user]);

  if (!user) return <p className="p-6">Non authentifié</p>;
  if (!userData) return <p className="p-6">Chargement...</p>;

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Erreur mise à jour profil");
      alert("Profil mis à jour ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde ❌");
    }
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
                value={userData.full_name}
                onChange={(e) =>
                  setUserData({ ...userData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userData.email} disabled />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={userData.telephone}
                onChange={(e) =>
                  setUserData({ ...userData, telephone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={userData.department}
                onChange={(e) =>
                  setUserData({ ...userData, department: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="darkMode">Mode sombre</Label>
              <Switch
                id="darkMode"
                checked={userData.dark_mode}
                onCheckedChange={(val) =>
                  setUserData({ ...userData, dark_mode: val })
                }
              />
            </div>
            <div className="pt-4">
              <Button onClick={handleSaveProfile}>Enregistrer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
