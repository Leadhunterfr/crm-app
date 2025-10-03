import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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
import {
  Crown,
  User as UserIcon,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger tous les utilisateurs + organisation
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Récupérer utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer profil complet
      const { data: profile, error: errProfile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (errProfile || !profile) {
        console.error("❌ Impossible de charger profil:", errProfile);
        setLoading(false);
        return;
      }

      // Charger tous les profils de la même organisation
      const { data: members, error: errMembers } = await supabase
        .from("user_profiles")
        .select("id, full_name, email, role, last_seen, created_at")
        .eq("org_id", profile.org_id);

      if (errMembers) {
        console.error("❌ Impossible de charger membres:", errMembers);
      } else {
        console.log("➡️ Membres organisation:", members);
        setUsers(members || []);
      }

      // Charger organisation (pour le nombre de sièges)
      const { data: orgData, error: errOrg } = await supabase
        .from("organizations")
        .select("id, name, seat")
        .eq("id", profile.org_id)
        .single();

      if (errOrg) {
        console.error("❌ Impossible de charger organisation:", errOrg);
      } else {
        setOrg(orgData);
      }

      setLoading(false);
    };

    load();
  }, []);

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

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6 min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border">
            <p>Membres organisation</p>
            <h3 className="text-2xl font-bold">
              {users.length} / {org?.seat ?? "?"}
            </h3>
          </motion.div>
        </div>

        {/* Table des membres */}
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
