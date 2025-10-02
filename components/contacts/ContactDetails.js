// components/contacts/ContactDetails.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient"; // ✅ Supabase
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Clock,
  MessageSquare,
  Flame,
  Snowflake,
  Globe,
  MessageCircle,
  Linkedin,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import InternalNotesSection from "./InternalNotesSection";
import RappelSection from "./RappelSection";
import ChatSidebar from "./ChatSidebar";

export default function ContactDetails({ contact, onClose, onEdit, onDelete }) {
  const [interactions, setInteractions] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  // 🔹 Charger les interactions depuis Supabase
  const loadInteractions = React.useCallback(async () => {
    setLoadingInteractions(true);
    try {
      const { data, error } = await supabase
        .from("interactions")
        .select("*")
        .eq("contact_id", contact.id)
        .neq("type", "NoteInterne") // exclure les notes internes
        .order("date_interaction", { ascending: false });

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des interactions:", error);
    }
    setLoadingInteractions(false);
  }, [contact.id]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  const getStatutColor = (statut) => {
    const colors = {
      Prospect: "bg-yellow-100 text-yellow-800",
      Contacté: "bg-blue-100 text-blue-800",
      Qualifié: "bg-purple-100 text-purple-800",
      Proposition: "bg-orange-100 text-orange-800",
      Négociation: "bg-indigo-100 text-indigo-800",
      Client: "bg-green-100 text-green-800",
      Perdu: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-slate-100 text-slate-800";
  };

  const getInteractionIcon = (type) => {
    const icons = {
      Appel: Phone,
      Email: Mail,
      LinkedIn: Linkedin,
      Réunion: Calendar,
      Note: MessageSquare,
      Modification: Edit,
    };
    return icons[type] || MessageSquare;
  };

  const getTemperatureStyle = (temperature) => {
    const styles = {
      Chaud: { icon: Flame, color: "text-red-600", label: "Chaud" },
      Tiède: { icon: TrendingUp, color: "text-orange-600", label: "Tiède" },
      Froid: { icon: Snowflake, color: "text-blue-600", label: "Froid" },
    };
    return (
      styles[temperature] || {
        icon: TrendingUp,
        color: "text-slate-600",
        label: temperature,
      }
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                {/* Avatar initials */}
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {contact.prenom?.charAt(0).toUpperCase() || "?"}
                  {contact.nom?.charAt(0).toUpperCase() || ""}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {contact.prenom && contact.nom
                      ? `${contact.prenom} ${contact.nom}`
                      : contact.nom || "Contact sans nom"}
                  </h2>
                  {contact.fonction && (
                    <p className="text-sm text-slate-600">{contact.fonction}</p>
                  )}
                  {contact.assigned_to_user_name && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Assigné à {contact.assigned_to_user_name}
                    </p>
                  )}
                </div>
              </DialogTitle>
          
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChatSidebar(true)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat & Tâches
                </Button>
                <Button variant="outline" onClick={() => onEdit(contact)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onDelete(contact.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                {/* 👉 Bouton Fermer */}
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
              </div>
            </div>
          </DialogHeader>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ======== Colonne principale ======== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Historique des interactions */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historique des interactions
                </h3>
                {loadingInteractions ? (
                  <p className="text-slate-500">Chargement...</p>
                ) : interactions.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    Aucune interaction enregistrée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {interactions.map((interaction, index) => {
                      const Icon = getInteractionIcon(interaction.type);
                      return (
                        <motion.div
                          key={interaction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3 p-3 bg-slate-50 rounded-lg"
                        >
                          <Icon className="w-4 h-4 text-slate-400 mt-1" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <Badge variant="outline">{interaction.type}</Badge>
                              <span className="text-xs text-slate-500">
                                {format(
                                  new Date(interaction.date_interaction),
                                  "dd MMM yyyy à HH:mm",
                                  { locale: fr }
                                )}
                              </span>
                            </div>
                            <p className="text-sm">
                              {interaction.description}
                            </p>
                            {interaction.statut_precedent &&
                              interaction.statut_actuel && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Statut: {interaction.statut_precedent} →{" "}
                                  {interaction.statut_actuel}
                                </p>
                              )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes internes */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-4">
                <InternalNotesSection contact={contact} />
              </div>
            </div>

            {/* ======== Colonne latérale ======== */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border p-4">
                <h3 className="text-lg font-semibold">Statut</h3>
                <Badge className={`${getStatutColor(contact.statut)} text-sm`}>
                  {contact.statut}
                </Badge>
              </div>

              <RappelSection contact={contact} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Sidebar */}
      {showChatSidebar && (
        <ChatSidebar
          contact={contact}
          onClose={() => setShowChatSidebar(false)}
          onInteractionAdded={loadInteractions}
        />
      )}
    </>
  );
}
