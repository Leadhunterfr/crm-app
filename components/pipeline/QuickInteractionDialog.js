// components/pipeline/QuickInteractionDialog.js
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
  Calendar,
  FileText,
  Clock,
  Save,
  Users,
} from "lucide-react";

const interactionTypes = [
  { value: "Appel", label: "Appel téléphonique", icon: Phone },
  { value: "Email", label: "Email", icon: Mail },
  { value: "LinkedIn", label: "Message LinkedIn", icon: Linkedin },
  { value: "Réunion", label: "Réunion", icon: Calendar },
  { value: "Note", label: "Note", icon: MessageSquare },
  { value: "NoteInterne", label: "Note interne", icon: Users },
  { value: "Modification", label: "Modification", icon: FileText },
];

export default function QuickInteractionDialog({
  contact,
  onClose,
  onInteractionAdded,
}) {
  const [formData, setFormData] = useState({
    type: "Note",
    description: "",
    date_interaction: new Date().toISOString().slice(0, 16), // pour input datetime-local
  });
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔹 Charger utilisateur courant depuis Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Erreur chargement user:", error);
        return;
      }
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // 🔹 Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const interactionData = {
        contact_id: contact.id,
        type: formData.type,
        description: formData.description,
        date_interaction: new Date(formData.date_interaction).toISOString(),
        created_by_user_id: currentUser?.id || null,
        created_by_user_name:
          currentUser?.user_metadata?.full_name || currentUser?.email || "Inconnu",
        internal: formData.type === "NoteInterne",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("interactions")
        .insert([interactionData])
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

  const getSelectedIcon = () => {
    const selectedType = interactionTypes.find(
      (t) => t.value === formData.type
    );
    return selectedType ? selectedType.icon : MessageSquare;
  };

  const SelectedIcon = getSelectedIcon();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Ajouter une interaction
          </DialogTitle>
          <p className="text-sm text-slate-600">
            Contact: <strong>{contact.nom}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type d'interaction</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_interaction">Date et heure</Label>
            <Input
              id="date_interaction"
              type="datetime-local"
              value={formData.date_interaction}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  date_interaction: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description
              {formData.type === "NoteInterne" && (
                <span className="text-xs text-slate-500 ml-2">
                  (Note visible uniquement par l'équipe interne)
                </span>
              )}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                formData.type === "NoteInterne"
                  ? "Ajouter une note interne pour l'équipe..."
                  : "Décrivez l'interaction..."
              }
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.description.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
