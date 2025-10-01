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
  const [loading, setLoading] = useState(true);

  // Charger utilisateur courant
  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) setCurrentUser(data);
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
    loadCurrentUser();
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const getRoleColor = (role) =>
    role === "admin"
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  const getRoleIcon = (role) => (role === "admin" ? Crown : UserIcon);

  const getLastSeenStatus = (lastSeen) => {
    if (!lastSeen)
      return { text: "Jamais connecté", color: "text-gray-500", icon: XCircle };

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = (now - lastSeenDate) / (1000 * 60);

    if (diffInMinutes < 5) {
      return { text: "En ligne", color: "text-green-600", icon: CheckCircle };
    } else if (diffInMinutes < 60) {
      return { text: `Il y a ${Math.floor(diffInMinutes)} min`, color: "text-blue-600", icon: Clock };
    } else if (diffInMinutes < 1440) {
      return { text: `Il y a ${Math.floor(diffInMinutes / 60)}h`, color: "text-yellow-600", icon: Clock };
    } else {
      return {
        text: format(lastSeenDate, "dd MMM yyyy", { locale: fr }),
        color: "text-gray-500",
        icon: Clock,
      };
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
    online: users.filter((u) => {
      if (!u.last_seen) return false;
      const diffInMinutes = (new Date() - new Date(u.last_seen)) / (1000 * 60);
      return diffInMinutes < 5;
    }).length,
  };

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6 min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Exemple de stat */}
          <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border">
            <p>Total utilisateurs</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </motion.div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
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
                  const roleIcon = getRoleIcon(u.role);
                  const roleColor = getRoleColor(u.role);
                  const lastSeen = getLastSeenStatus(u.last_seen);

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
                      <TableCell className={lastSeen.color}>
                        {React.createElement(lastSeen.icon, { className: "w-3 h-3 mr-1 inline" })}
                        {lastSeen.text}
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
