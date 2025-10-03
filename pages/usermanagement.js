// pages/users.js (ou la page de gestion des utilisateurs)
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState(null);
  const [orgSeats, setOrgSeats] = useState(null);
  const [users, setUsers] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
  
      // profil courant → org_id
      const { data: me, error: meErr } = await supabase
        .from("user_profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();
  
      if (meErr || !me?.org_id) {
        console.error("Impossible de récupérer org_id du user courant", meErr);
        setLoading(false);
        return;
      }
  
      console.log("➡️ org_id courant:", me.org_id);
  
      // organisation (nb seats)
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("seat")
        .eq("id", me.org_id)
        .single();
  
      if (orgErr) console.error("Erreur chargement org:", orgErr);
  
      // tous les profils de l’org
      const { data: members, error: membersErr } = await supabase
        .from("user_profiles")
        .select("id, full_name, email, role, created_at, org_id")
        .eq("org_id", me.org_id);
  
      if (membersErr) console.error("Erreur chargement users:", membersErr);
  
      console.log("➡️ membres récupérés:", members);
  
      setOrgSeats(org?.seat ?? 0);
      setUsers(members || []);
    } catch (e) {
      console.error("Erreur loadData:", e);
    }
    setLoading(false);
  };


  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="p-6">Chargement…</p>;

  return (
    <div className="p-6 min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Stat sièges occupés / disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border">
            <p className="text-slate-600">Utilisateurs (org)</p>
            <h3 className="text-2xl font-bold">
              {users.length}{typeof orgSeats === "number" ? ` / ${orgSeats}` : ""}
            </h3>
          </motion.div>
        </div>

        {/* Liste des profils de l’org */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs de l’organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Créé le</TableHead>
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
                        {u.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-slate-500">
                      Aucun utilisateur pour cette organisation.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
