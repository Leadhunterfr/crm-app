import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Shield,
  Search,
  Settings,
  Phone,
  Mail,
  Building2,
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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const filterUsers = React.useCallback(() => {
    let filtered = [...users];
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadCurrentUser = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur actuel :", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await User.list("-last_seen");
      setUsers(allUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Erreur lors de la modification du rôle :", error);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
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
      return {
        text: `Il y a ${Math.floor(diffInMinutes)} min`,
        color: "text-blue-600",
        icon: Clock,
      };
    } else if (diffInMinutes < 1440) {
      return {
        text: `Il y a ${Math.floor(diffInMinutes / 60)}h`,
        color: "text-yellow-600",
        icon: Clock,
      };
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

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-orange-500" />
              Gestion des utilisateurs
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gérez les rôles et permissions des membres de votre équipe
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total utilisateurs",
              value: stats.total,
              icon: <Users className="w-6 h-6 text-blue-500" />,
              bg: "bg-blue-500",
            },
            {
              label: "Administrateurs",
              value: stats.admins,
              icon: <Crown className="w-6 h-6 text-orange-500" />,
              bg: "bg-orange-500",
            },
            {
              label: "Utilisateurs",
              value: stats.users,
              icon: <UserIcon className="w-6 h-6 text-blue-500" />,
              bg: "bg-blue-500",
            },
            {
              label: "En ligne",
              value: stats.online,
              icon: <CheckCircle className="w-6 h-6 text-green-500" />,
              bg: "bg-green-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
