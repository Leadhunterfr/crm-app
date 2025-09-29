import React from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statutColors = {
  "Prospect": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Contacté": "bg-blue-100 text-blue-800 border-blue-200",
  "Qualifié": "bg-purple-100 text-purple-800 border-purple-200",
  "Proposition": "bg-orange-100 text-orange-800 border-orange-200", 
  "Négociation": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Client": "bg-green-100 text-green-800 border-green-200",
  "Perdu": "bg-red-100 text-red-800 border-red-200"
};

const sourceColors = {
  "Site web": "bg-blue-50 text-blue-700 border-blue-200",
  "Référence": "bg-green-50 text-green-700 border-green-200",
  "LinkedIn": "bg-purple-50 text-purple-700 border-purple-200",
  "Salon": "bg-orange-50 text-orange-700 border-orange-200",
  "Publicité": "bg-pink-50 text-pink-700 border-pink-200",
  "Autre": "bg-gray-50 text-gray-700 border-gray-200"
};

export default function ContactTable({ 
  contacts, 
  loading, 
  onView, 
  onEdit, 
  onDelete,
  onUpdate 
}) {
  const [editingField, setEditingField] = React.useState(null);
  const [editValue, setEditValue] = React.useState("");

  const handleInlineEdit = (contactId, field, currentValue) => {
    setEditingField(`${contactId}-${field}`);
    setEditValue(currentValue || "");
  };

  const handleSaveInlineEdit = async (contactId, field) => {
    await onUpdate(contactId, { [field]: editValue });
    setEditingField(null);
    setEditValue("");
  };

  const handleCancelInlineEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-700/50">
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Société</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Téléphone</TableHead>
            <TableHead className="font-semibold">Source</TableHead>
            <TableHead className="font-semibold">Statut</TableHead>
            <TableHead className="font-semibold">Dernière interaction</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => (
            <motion.tr
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {contact.nom ? contact.nom.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    {editingField === `${contact.id}-nom` ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveInlineEdit(contact.id, "nom")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveInlineEdit(contact.id, "nom");
                          if (e.key === "Escape") handleCancelInlineEdit();
                        }}
                        className="w-32"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
                        onClick={() => handleInlineEdit(contact.id, "nom", contact.nom)}
                      >
                        {contact.nom || "Sans nom"}
                      </div>
                    )}
                    {contact.fonction && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">{contact.fonction}</p>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {editingField === `${contact.id}-societe` ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveInlineEdit(contact.id, "societe")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveInlineEdit(contact.id, "societe");
                      if (e.key === "Escape") handleCancelInlineEdit();
                    }}
                    className="w-40"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
                    onClick={() => handleInlineEdit(contact.id, "societe", contact.societe)}
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{contact.societe || "Non renseignée"}</span>
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              </TableCell>

              <TableCell>
                {editingField === `${contact.id}-telephone` ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSaveInlineEdit(contact.id, "telephone")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveInlineEdit(contact.id, "telephone");
                      if (e.key === "Escape") handleCancelInlineEdit();
                    }}
                    className="w-32"
                    autoFocus
                  />
                ) : (
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
                    onClick={() => handleInlineEdit(contact.id, "telephone", contact.telephone)}
                  >
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{contact.telephone || "Non renseigné"}</span>
                  </div>
                )}
              </TableCell>

              <TableCell>
                <Badge className={sourceColors[contact.source] || sourceColors["Autre"]}>
                  {contact.source}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge className={statutColors[contact.statut] || statutColors["Prospect"]}>
                  {contact.statut}
                </Badge>
              </TableCell>

              <TableCell>
                {contact.derniere_interaction ? (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {format(new Date(contact.derniere_interaction), 'dd MMM yyyy', { locale: fr })}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">Jamais</span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(contact)}
                    className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(contact)}
                    className="h-8 w-8 hover:bg-green-100 hover:text-green-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon" 
                    onClick={() => onDelete(contact.id)}
                    className="h-8 w-8 hover:bg-red-100 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Aucun contact trouvé
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Commencez par ajouter votre premier contact
          </p>
        </div>
      )}
    </div>
  );
}
