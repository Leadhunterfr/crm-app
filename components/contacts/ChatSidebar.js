import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient"; // ✅ Connexion Supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, MessageSquare, Phone, Mail, Linkedin, Calendar, 
  Send, Bell, Clock 
} from "lucide-react";

const interactionTypes = [
  { value: "Appel", label: "Appel téléphonique", icon: Phone },
  { value: "Email", label: "Email", icon: Mail },
  { value: "LinkedIn", label: "Message LinkedIn", icon: Linkedin },
  { value: "Note", label: "Note générale", icon: MessageSquare },
];

const rappelTypes = [
  { value: "Appel", label: "Rappel d'appel", icon: Phone },
  { value: "Email", label: "Rappel email", icon: Mail },
  { value: "Autre", label: "Autre rappel", icon: Bell },
];

export default function ChatSidebar({ contact, onClose, onInteractionAdded }) {
  const [activeTab, setActiveTab] = useState("interactions");
  const [newInteraction, setNewInteraction] = useState({
    type: "Note",
    description: "",
    date_interaction: new Date().toISOString().slice(0, 16),
  });
  const [newRappel, setNewRappel] = useState({
    type: "Appel",
    date_rappel: new Date().toISOString().slice(0, 16),
    note: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setCurrentUser(user);
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!newInteraction.description.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("interactions").insert([{
        contact_id: contact.id,
        type: newInteraction.type,
        description: newInteraction.description,
        date_interaction: new Date(newInteraction.date_interaction).toISOString(),
        created_by_user_id: currentUser?.id,
      }]);
      if (error) throw error;

      setNewInteraction({
        type: "Note",
        description: "",
        date_interaction: new Date().toISOString().slice(0, 16),
      });

      if (onInteractionAdded) onInteractionAdded();
    } catch (error) {
      console.error("Erreur ajout interaction:", error);
    }
    setSending(false);
  };

  const handleAddRappel = async (e) => {
    e.preventDefault();
    if (!newRappel.note.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("rappels").insert([{
        contact_id: contact.id,
        user_id: currentUser?.id,
        type: newRappel.type,
        date_rappel: new Date(newRappel.date_rappel).toISOString(),
        note: newRappel.note,
      }]);
      if (error) throw error;

      setNewRappel({
        type: "Appel",
        date_rappel: new Date().toISOString().slice(0, 16),
        note: "",
      });
    } catch (error) {
      console.error("Erreur ajout rappel:", error);
    }
    setSending(false);
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {contact.prenom ? contact.prenom.charAt(0).toUpperCase() : "?"}
              {contact.nom ? contact.nom.charAt(0).toUpperCase() : ""}
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                {contact.prenom} {contact.nom}
              </h3>
              <p className="text-sm text-slate-500">{contact.societe}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <Button
            variant={activeTab === "interactions" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("interactions")}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Interactions
          </Button>
          <Button
            variant={activeTab === "rappels" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("rappels")}
          >
            <Bell className="w-4 h-4 mr-2" />
            Tâches
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "interactions" && (
          <div className="p-4 space-y-4">
            <h4 className="font-medium mb-3">Ajouter une interaction</h4>
            <form onSubmit={handleAddInteraction} className="space-y-4">
              <div className="space-y-2">
                <Label>Type d'interaction</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={newInteraction.type}
                  onChange={(e) =>
                    setNewInteraction((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  {interactionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date et heure</Label>
                <Input
                  type="datetime-local"
                  value={newInteraction.date_interaction}
                  onChange={(e) =>
                    setNewInteraction((prev) => ({
                      ...prev,
                      date_interaction: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newInteraction.description}
                  onChange={(e) =>
                    setNewInteraction((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Que s'est-il passé lors de cette interaction ?"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={sending || !newInteraction.description.trim()} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Enregistrement..." : "Ajouter l'interaction"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "rappels" && (
          <div className="p-4 space-y-4">
            <h4 className="font-medium mb-3">Planifier une tâche</h4>
            <form onSubmit={handleAddRappel} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de rappel</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={newRappel.type}
                  onChange={(e) =>
                    setNewRappel((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  {rappelTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date et heure</Label>
                <Input
                  type="datetime-local"
                  value={newRappel.date_rappel}
                  onChange={(e) =>
                    setNewRappel((prev) => ({
                      ...prev,
                      date_rappel: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Note</Label>
                <Textarea
                  value={newRappel.note}
                  onChange={(e) =>
                    setNewRappel((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Que devez-vous faire ou vous rappeler ?"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={sending || !newRappel.note.trim()} className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                {sending ? "Enregistrement..." : "Planifier la tâche"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
