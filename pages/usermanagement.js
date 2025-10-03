import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Shield, Crown, User as UserIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orgSeats, setOrgSeats] = useState(null); // ✅ nombre total de sièges
  const [loading, setLoading] = useState(true);

  // Charger utilisateur courant + organisation
  const loadCurrentUserAndOrg = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Profil utilisateur
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*, organizations(seat)")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCurrentUser(profile);
      setOrgSeats(profile.organizations?.seat || 0); // ✅ nombre de sièges
    }
  };

  // Charger tous les utilisateurs de la même organisation
  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer org_id du user courant
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (!profile?.org_id) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("org_id", profile.org_id);

      if (!error) setUsers(data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCurrentUserAndOrg();
    loadUsers();
  }, []);

  // === Rendu ===
  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6 min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border">
            <p>Utilisateurs</p>
            <h3 className="text-2xl font-bold">
              {users.length}{orgSeats ? ` / ${orgSeats}` : ""} {/* ✅ 2/5 sièges */}
            </h3>
          </motion.div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs de l'organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const roleIcon = u.role === "admin" ? Crown : UserIcon;
                  const roleColor =
                    u.role === "admin"
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-blue-100 text-blue-800 border-blue-200";

                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColor}>
                          {React.createElement(roleIcon, { className: "w-3 h-3 mr-1" })}
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.last_seen ? format(new Date(u.last_seen), "dd MMM yyyy HH:mm", { locale: fr }) : "Jamais"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
