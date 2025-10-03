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
  const [orgSeats, setOrgSeats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrgAndUsers = async () => {
    setLoading(true);
    try {
      // 1. Récupérer user courant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Charger profil courant avec org_id
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.org_id) {
        console.error("Impossible de trouver org_id:", profileError);
        return;
      }

      // 3. Charger organisation (pour le nombre de sièges)
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("seat")
        .eq("id", profile.org_id)
        .single();

      if (orgError) console.error("Erreur récupération organisation:", orgError);
      else setOrgSeats(org?.seat || 0);

      // 4. Charger tous les utilisateurs liés à cette organisation
      const { data: orgUsers, error: usersError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("org_id", profile.org_id);

      if (usersError) console.error("Erreur récupération users:", usersError);
      else setUsers(orgUsers || []);
    } catch (err) {
      console.error("Erreur loadOrgAndUsers:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrgAndUsers();
  }, []);

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6 min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border">
            <p>Utilisateurs</p>
            <h3 className="text-2xl font-bold">
              {users.length}{orgSeats ? ` / ${orgSeats}` : ""}
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
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          u.role === "admin"
                            ? "bg-orange-100 text-orange-800 border-orange-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.last_seen
                        ? format(new Date(u.last_seen), "dd MMM yyyy HH:mm", { locale: fr })
                        : "Jamais"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
