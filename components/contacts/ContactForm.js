import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient"; // ✅ Connexion Supabase
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
  X,
  Save,
  User,
  Building2,
  Mail,
  Phone,
  Tag,
  Globe,
  MessageCircle,
  Linkedin,
  Flame,
  Snowflake,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

const sourcesOptions = ["Site web", "Référence", "LinkedIn", "Salon", "Publicité", "Autre"];
const statutsOptions = ["Prospect", "Contacté", "Qualifié", "Proposition", "Négociation", "Client", "Perdu"];
const contactMethodOptions = ["Email", "Téléphone", "Non spécifié"];

const TemperatureSelector = ({ value, onChange }) => {
  const temperatures = [
    { value: "Chaud", label: "Chaud", icon: Flame, color: "bg-red-100 text-red-600 border-red-200" },
    { value: "Tiède", label: "Tiède", icon: TrendingUp, color: "bg-orange-100 text-orange-600 border-orange-200" },
    { value: "Froid", label: "Froid", icon: Snowflake, color: "bg-blue-100 text-blue-600 border-blue-200" }
  ];

  return (
    <div className="flex gap-2">
      {temperatures.map(temp => {
        const Icon = temp.icon;
        return (
          <Button
            key={temp.value}
            type="button"
            variant={value === temp.value ? "default" : "outline"}
            className={`flex items-center gap-2 ${value === temp.value ? temp.color : `hover:${temp.color}`}`}
            onClick={() => onChange(temp.value)}
          >
            <Icon className="w-4 h-4" />
            {temp.label}
          </Button>
        );
      })}
    </div>
  );
};

export default function ContactForm({ contact, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    prenom: contact?.prenom || "",
    nom: contact?.nom || "",
    societe: contact?.societe || "",
    email: contact?.email || "",
    telephone: contact?.telephone || "",
    site_web: contact?.site_web || "",
    linkedin: contact?.linkedin || "",
    source: contact?.source || "Site web",
    statut: contact?.statut || "Prospect",
    notes: contact?.notes || "",
    fonction: contact?.fonction || "",
    adresse: contact?.adresse || "",
    valeur_estimee: contact?.valeur_estimee || "",
    temperature: contact?.temperature || "Tiède",
    methode_contact_preferee: contact?.methode_contact_preferee || "Non spécifié",
    date_cloture_prevue: contact?.date_cloture_prevue || "",
    tags: contact?.tags || [],
  });

  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (contact?.id) {
        // 🔹 Update contact
        const { error } = await supabase
          .from("contacts")
          .update(formData)
          .eq("id", contact.id);

        if (error) throw error;
      } else {
        // 🔹 Insert new contact
        const { error } = await supabase.from("contacts").insert([formData]);
        if (error) throw error;
      }

      if (onSaved) onSaved();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }

    setSaving(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const openLinkInNewTab = (url) => {
    if (url) {
      const fullUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `https://${url}`;
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {contact ? "Modifier le contact" : "Nouveau contact"}
          </DialogTitle>
        </DialogHeader>

        {/* Formulaire identique, seul handleSubmit change */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... mêmes champs que ta version ... */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
