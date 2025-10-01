// pages/settings.js
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail, Key, UserPlus } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Charger les infos utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("Non authentifié");
        const { user } = await res.json();
        setUserData(user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: userData.full_name,
          telephone: userData.telephone,
          department: userData.department,
          darkMode: userData.dark_mode,
        }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour profil");
      alert("Profil mis à jour ✅");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde ❌");
    }
  };

  if (loading) return <p className="p-6">Chargement...</p>;
  if (!userData) return <p className="p-6">Non authentifié</p>;

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
                value={userData.full_name || ""}
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
                value={userData.telephone || ""}
                onChange={(e) =>
                  setUserData({ ...userData, telephone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Input
                id="department"
                value={userData.department || ""}
                onChange={(e) =>
                  setUserData({ ...userData, department: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="darkMode">Mode sombre</Label>
              <Switch
                id="darkMode"
                checked={userData.dark_mode || false}
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
