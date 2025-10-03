// components/pipeline/QuickDialog.js
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  MessageSquare,
  Phone,
  Mail,
  Linkedin,
  Bell,
  Save,
  Clock,
} from "lucide-react";

// 🔹 mêmes types que ChatSidebar
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

export default function QuickDialog({ contact, onClose, onInteractionAdded, onRappelAdded }) {
  const [activeTab, setActiveTab] = useState("interaction");
  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [interaction, setInteraction] = useState({
    type: "Note",
    description: "",
    date_interaction: new Date().toISOString().slice(0, 16),
  });

  const [rappel, setRappel] = useState({
    type: "Appel",
    date_rappel: new Date().toISOString().slice(0, 16),
    note: "",
  });

  // 🔹 Charger utilisateur courant
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error) setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // 🔹 Ajout Interaction
  const handleInteractionSubmit = async (e) => {
    e.preventDefault();
    if (!interaction.description.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("interactions")
        .insert([
          {
            contact_id: contact.id,
            type: interaction.type,
            description: interaction.description,
            date_interaction: new Date(interaction.date_interaction).toISOString(),
            created_by_user_id: currentUser?.id,
            org_id: contact.org_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (onInteractionAdded) onInteractionAdded(data);
      onClose();
    } catch (err) {
      console.error("Erreur ajout interaction:", err);
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Ajout Rappel
  const handleRappelSubmit = async (e) => {
    e.preventDefault();
    if (!rappel.note.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("rappels")
        .insert([
          {
            contact_id: contact.id,
            user_id: currentUser?.id,
            type: rappel.type,
            date_rappel: new Date(rappel.date_rappel).toISOString(),
            note: rappel.note,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (onRappelAdded) onRappelAdded(data);
      onClose();
    } catch (err) {
      console.error("Erreur ajout rappel:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {activeTab === "interaction" ? "Ajouter une interaction" : "Planifier une tâche"}
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Contact: <strong>{contact.prenom} {contact.nom}</strong>
          </p>
        </DialogHeader>

        {/* Onglets */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={activeTab === "interaction" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("interaction")}
          >
            Interactions
          </Button>
          <Button
            type="button"
            variant={activeTab === "rappel" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("rappel")}
          >
            Tâches
          </Button>
        </div>

        {/* Formulaires */}
        {activeTab === "interaction" && (
          <form onSubmit={handleInteractionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type d'interaction</Label>
              <Select
                value={interaction.type}
                onValueChange={(value) =>
                  setInteraction((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interactionTypes.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {t.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date et heure</Label>
              <Input
                type="datetime-local"
                value={interaction.date_interaction}
                onChange={(e) =>
                  setInteraction((prev) => ({
                    ...prev,
                    date_interaction: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={interaction.description}
                onChange={(e) =>
                  setInteraction((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Décrivez l'interaction..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}

        {activeTab === "rappel" && (
          <form onSubmit={handleRappelSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type de tâche</Label>
              <Select
                value={rappel.type}
                onValueChange={(value) =>
                  setRappel((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rappelTypes.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {t.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date et heure</Label>
              <Input
                type="datetime-local"
                value={rappel.date_rappel}
                onChange={(e) =>
                  setRappel((prev) => ({ ...prev, date_rappel: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={rappel.note}
                onChange={(e) =>
                  setRappel((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Que devez-vous faire ou vous rappeler ?"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
