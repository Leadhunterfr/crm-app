import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  X, Save, User, Building2, Mail, Phone, Tag, Globe, MessageCircle,
  Linkedin, Flame, Snowflake, TrendingUp, ExternalLink
} from "lucide-react";

const sourcesOptions = ["Site web", "Référence", "LinkedIn", "Salon", "Publicité", "Autre"];
const statutsOptions = ["Prospect", "Contacté", "Qualifié", "Proposition", "Négociation", "Client", "Perdu"];
const contactMethodOptions = ["Email", "Téléphone", "Non spécifié"];

const TemperatureSelector = ({ value, onChange }) => {
  const temps = [
    { value: "Chaud",  label: "Chaud",  icon: Flame,      color: "bg-red-100 text-red-600 border-red-200" },
    { value: "Tiède",  label: "Tiède",  icon: TrendingUp, color: "bg-orange-100 text-orange-600 border-orange-200" },
    { value: "Froid",  label: "Froid",  icon: Snowflake,  color: "bg-blue-100 text-blue-600 border-blue-200" },
  ];
  return (
    <div className="flex gap-2">
      {temps.map(t => {
        const Icon = t.icon;
        const active = value === t.value;
        return (
          <Button
            key={t.value}
            type="button"
            variant={active ? "default" : "outline"}
            className={`flex items-center gap-2 ${active ? t.color : ""}`}
            onClick={() => onChange(t.value)}
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </Button>
        );
      })}
    </div>
  );
};

export default function ContactForm({ contact, open, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    prenom:  contact?.prenom  || "",
    nom:     contact?.nom     || "",
    societe: contact?.societe || "",
    email:   contact?.email   || "",
    telephone: contact?.telephone || "",
    site_web: contact?.site_web || "",
    linkedin: contact?.linkedin || "",
    source:  contact?.source  || "Site web",
    statut:  contact?.statut  || "Prospect",
    notes:   contact?.notes   || "",
    fonction: contact?.fonction || "",
    adresse: contact?.adresse || "",
    valeur_estimee: contact?.valeur_estimee ?? "",
    temperature: contact?.temperature || "Tiède",
    methode_contact_preferee: contact?.methode_contact_preferee || "Non spécifié",
    date_cloture_prevue: contact?.date_cloture_prevue || "",
    tags: Array.isArray(contact?.tags) ? contact.tags : [],
  });
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const addTag = () => {
    const t = newTag.trim();
    if (!t || formData.tags.includes(t)) return;
    setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setNewTag("");
  };
  const removeTag = (t) =>
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(x => x !== t) }));

  const openLinkInNewTab = (url) => {
    if (!url) return;
    const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(full, "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1) user courant
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error("Utilisateur non authentifié.");
  
      // 2) org_id du user (nécessaire pour RLS on contacts)
      const { data: profile, error: profErr } = await supabase
        .from("user_profiles")
        .select("org_id")
        .eq("id", user.id)
        .single();
      if (profErr) throw profErr;
      const org_id = profile?.org_id;
      if (!org_id) throw new Error("Impossible de récupérer votre organisation.");
  
      // 3) payload filtré et nettoyé
      const payload = {
        prenom: formData.prenom || null,
        nom: formData.nom || null,
        societe: formData.societe || null,
        email: formData.email || null,
        telephone: formData.telephone || null,
        site_web: formData.site_web || null,
        linkedin: formData.linkedin || null,
        source: formData.source || null,
        statut: formData.statut || null,
        notes: formData.notes || null,
        fonction: formData.fonction || null,
        adresse: formData.adresse || null,
        valeur_estimee:
          formData.valeur_estimee === "" || formData.valeur_estimee === null
            ? null
            : Number(formData.valeur_estimee),
        temperature: formData.temperature || null,
        methode_contact_preferee: formData.methode_contact_preferee || null,
        date_cloture_prevue:
          formData.date_cloture_prevue && formData.date_cloture_prevue.trim() !== ""
            ? formData.date_cloture_prevue
            : null, // ✅ vide → null
        tags: formData.tags?.length ? formData.tags : null, // nécessite text[] ou jsonb en base
      };
  
      if (contact?.id) {
        // UPDATE
        const { error } = await supabase
          .from("contacts")
          .update(payload)
          .eq("id", contact.id)
          .eq("org_id", org_id);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase
          .from("contacts")
          .insert([{ ...payload, org_id }]);
        if (error) throw error;
      }
  
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Échec de l’enregistrement");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose?.(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {contact ? "Modifier le contact" : "Nouveau contact"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ===== Informations principales ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Prénom
              </Label>
              <Input id="prenom" value={formData.prenom}
                onChange={(e)=>handleChange("prenom", e.target.value)} placeholder="John" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Nom *
              </Label>
              <Input id="nom" required value={formData.nom}
                onChange={(e)=>handleChange("nom", e.target.value)} placeholder="Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="societe" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Société
              </Label>
              <Input id="societe" value={formData.societe}
                onChange={(e)=>handleChange("societe", e.target.value)} placeholder="Entreprise SARL" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email *
              </Label>
              <Input id="email" type="email" required value={formData.email}
                onChange={(e)=>handleChange("email", e.target.value)} placeholder="john@exemple.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Téléphone
              </Label>
              <Input id="telephone" value={formData.telephone}
                onChange={(e)=>handleChange("telephone", e.target.value)} placeholder="+33 1 23 45 67 89" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_web" className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Site web
              </Label>
              <div className="relative flex items-center">
                <Input id="site_web" className="pr-10" value={formData.site_web}
                  onChange={(e)=>handleChange("site_web", e.target.value)} placeholder="https://exemple.com" />
                {formData.site_web && (
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-0 h-8 w-8"
                    onClick={() => openLinkInNewTab(formData.site_web)}>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </Label>
              <div className="relative flex items-center">
                <Input id="linkedin" className="pr-10" value={formData.linkedin}
                  onChange={(e)=>handleChange("linkedin", e.target.value)} placeholder="linkedin.com/in/john-doe" />
                {formData.linkedin && (
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-0 h-8 w-8"
                    onClick={() => openLinkInNewTab(formData.linkedin)}>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fonction">Fonction</Label>
              <Input id="fonction" value={formData.fonction}
                onChange={(e)=>handleChange("fonction", e.target.value)} placeholder="Directeur commercial" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(v)=>handleChange("source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sourcesOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(v)=>handleChange("statut", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statutsOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valeur_estimee">Valeur estimée (€)</Label>
              <Input id="valeur_estimee" type="number"
                value={formData.valeur_estimee}
                onChange={(e)=>handleChange("valeur_estimee", e.target.value)}
                placeholder="5000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="methode_contact_preferee" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Contact préféré
              </Label>
              <Select value={formData.methode_contact_preferee}
                onValueChange={(v)=>handleChange("methode_contact_preferee", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {contactMethodOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_cloture_prevue">Date de clôture prévue</Label>
              <Input id="date_cloture_prevue" type="date"
                value={formData.date_cloture_prevue}
                onChange={(e)=>handleChange("date_cloture_prevue", e.target.value)} />
            </div>
          </div>

          {/* Température */}
          <div className="space-y-2">
            <Label>Température</Label>
            <TemperatureSelector
              value={formData.temperature}
              onChange={(v)=>handleChange("temperature", v)}
            />
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" value={formData.adresse}
              onChange={(e)=>handleChange("adresse", e.target.value)} placeholder="123 Rue de la Paix, 75001 Paris" />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newTag} onChange={(e)=>setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyDown={(e)=> e.key==="Enter" && (e.preventDefault(), addTag())} className="flex-1" />
              <Button type="button" onClick={addTag} variant="outline">Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                  <button type="button" onClick={()=>removeTag(tag)}
                    className="w-4 h-4 hover:bg-blue-200 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={4} value={formData.notes}
              onChange={(e)=>handleChange("notes", e.target.value)} placeholder="Notes et commentaires..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
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
