
import React, { useState, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  Filter,
  X,
  Settings,
  Flame,
  Snowflake,
  TrendingUp,
  MessageSquare // Added MessageSquare icon
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

const temperatureIcons = {
  Chaud: <Flame className="w-3 h-3" />,
  Tiède: <TrendingUp className="w-3 h-3" />,
  Froid: <Snowflake className="w-3 h-3" />
};

const temperatureColors = {
  Chaud: "bg-red-100 text-red-600 border-red-200",
  Tiède: "bg-orange-100 text-orange-600 border-orange-200",
  Froid: "bg-blue-100 text-blue-600 border-blue-200"
};

const ColumnResizer = ({ onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = e.currentTarget.parentElement.offsetWidth;
    
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(100, startWidth.current + diff);
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="absolute right-0 top-0 w-1 h-full bg-transparent hover:bg-blue-300 cursor-col-resize z-10"
      onMouseDown={handleMouseDown}
      style={{ opacity: isResizing ? 1 : 0 }}
    />
  );
};

export default function EnhancedContactTable({ 
  contacts, 
  loading, 
  onView, 
  onEdit, 
  onDelete,
  onUpdate,
  columns,
  onColumnManager,
  onOpenChat // Added onOpenChat prop
}) {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const [showFilters, setShowFilters] = useState({});
  const [columnWidths, setColumnWidths] = useState(() => {
    const defaultWidths = { actions: 160 }; // Adjusted default width for actions column
    columns?.forEach(col => {
      defaultWidths[col.id] = parseInt(col.width) || 150;
    });
    return defaultWidths;
  });

  const visibleColumns = columns?.filter(col => col.visible) || [];

  const handleInlineEdit = (contactId, field, currentValue) => {
    setEditingField(`${contactId}-${field}`);
    setEditValue(currentValue || "");
  };

  const handleSaveInlineEdit = async (contactId, field) => {
    let finalValue = editValue;
    
    if (field === "valeur_estimee") {
      finalValue = parseFloat(editValue) || 0;
    }
    
    await onUpdate(contactId, { [field]: finalValue });
    setEditingField(null);
    setEditValue("");
  };

  const handleCancelInlineEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleColumnFilter = (columnId, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const toggleColumnFilter = (columnId) => {
    setShowFilters(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const clearColumnFilter = (columnId) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnId];
      return newFilters;
    });
    setShowFilters(prev => ({
      ...prev,
      [columnId]: false
    }));
  };

  const handleColumnResize = (columnId, newWidth) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnId]: newWidth
    }));
  };

  // Appliquer les filtres par colonne
  const filteredContacts = contacts.filter(contact => {
    return Object.entries(columnFilters).every(([columnId, filterValue]) => {
      if (!filterValue) return true;
      
      let contactValue = contact[columnId];
      if (!contactValue) return false;
      
      return contactValue.toString().toLowerCase().includes(filterValue.toLowerCase());
    });
  });

  const renderCell = (contact, column) => {
    const isEditing = editingField === `${contact.id}-${column.id}`;
    let value = contact[column.id];

    // Cellule actions (toujours en première position)
    if (column.id === "actions") {
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChat && onOpenChat(contact)} // New Chat & Tasks button
            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
            title="Chat & Tâches"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
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
      );
    }

    // Cellule prénom avec avatar
    if (column.id === "prenom") {
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {contact.prenom ? contact.prenom.charAt(0).toUpperCase() : 
             contact.nom ? contact.nom.charAt(0).toUpperCase() : "?"}
            {contact.nom && contact.prenom ? contact.nom.charAt(0).toUpperCase() : ""}
          </div>
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSaveInlineEdit(contact.id, column.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveInlineEdit(contact.id, column.id);
                if (e.key === "Escape") handleCancelInlineEdit();
              }}
              className="w-32"
              autoFocus
            />
          ) : (
             <span
              className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
              onClick={() => handleInlineEdit(contact.id, column.id, value)}
            >
              {value || "Ajouter prénom"}
            </span>
          )}
        </div>
      );
    }
    
    // Cellule nom
    if (column.id === "nom") {
        return isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleSaveInlineEdit(contact.id, column.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveInlineEdit(contact.id, column.id);
                if (e.key === "Escape") handleCancelInlineEdit();
              }}
              className="w-32"
              autoFocus
            />
          ) : (
             <span
              className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
              onClick={() => handleInlineEdit(contact.id, column.id, value)}
            >
              {value || "Nom requis"}
            </span>
          );
    }

    // Cellule société avec icône
    if (column.id === "societe") {
      return isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveInlineEdit(contact.id, column.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveInlineEdit(contact.id, column.id);
            if (e.key === "Escape") handleCancelInlineEdit();
          }}
          className="w-40"
          autoFocus
        />
      ) : (
        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
          onClick={() => handleInlineEdit(contact.id, column.id, value)}
        >
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>{value || "Non renseignée"}</span>
        </div>
      );
    }

    // Cellule email avec lien
    if (column.id === "email") {
      return (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {value}
          </a>
        </div>
      );
    }

    // Cellule téléphone avec bouton d'appel vert
    if (column.id === "telephone") {
      return isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveInlineEdit(contact.id, column.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveInlineEdit(contact.id, column.id);
            if (e.key === "Escape") handleCancelInlineEdit();
          }}
          className="w-32"
          autoFocus
        />
      ) : (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-green-100"
                onClick={(e) => { e.stopPropagation(); window.open(`tel:${value}`); }}
                title="Appeler ce numéro"
              >
                <Phone className="w-3 h-3 text-green-600" />
              </Button>
              <span
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
                onClick={() => handleInlineEdit(contact.id, column.id, value)}
              >
                {value}
              </span>
            </>
          ) : (
            <span
              className="cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
              onClick={() => handleInlineEdit(contact.id, column.id, value)}
            >
              Ajouter téléphone
            </span>
          )}
        </div>
      );
    }

    // Cellule température - boutons clickables
    if (column.id === "temperature") {
      const temperatures = [
        { value: "Chaud", icon: Flame, color: "bg-red-100 text-red-600 border-red-200" },
        { value: "Tiède", icon: TrendingUp, color: "bg-orange-100 text-orange-600 border-orange-200" },
        { value: "Froid", icon: Snowflake, color: "bg-blue-100 text-blue-600 border-blue-200" }
      ];

      if (isEditing) {
        return (
          <div className="flex gap-1">
            {temperatures.map(temp => {
              const Icon = temp.icon;
              const isSelected = value === temp.value;
              return (
                <Button
                  key={temp.value}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className={`h-6 px-2 ${isSelected ? temp.color : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'} border ${isSelected ? temp.color : 'border-slate-200 dark:border-slate-600'}`}
                  onClick={async (e) => {
                    e.stopPropagation(); // Prevent triggering cell inline edit
                    await onUpdate(contact.id, { temperature: temp.value });
                    setEditingField(null);
                  }}
                >
                  <Icon className="w-3 h-3" />
                </Button>
              );
            })}
          </div>
        );
      } else {
        const temp = temperatures.find(t => t.value === value) || temperatures[1]; // Default to Tiède if not found
        const Icon = temp.icon;
        return (
          <Button
            variant="outline"
            size="sm"
            className={`h-6 px-2 ${temp.color} border ${temp.color} cursor-pointer`}
            onClick={() => handleInlineEdit(contact.id, column.id, value)}
          >
            <Icon className="w-3 h-3 mr-1" />
            {temp.value}
          </Button>
        );
      }
    }

    // Cellule statut avec sélection
    if (column.id === "statut") {
      return isEditing ? (
        <Select
          value={editValue}
          onValueChange={async (newValue) => {
            await onUpdate(contact.id, { statut: newValue });
            setEditingField(null);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["Prospect", "Contacté", "Qualifié", "Proposition", "Négociation", "Client", "Perdu"].map(statut => (
              <SelectItem key={statut} value={statut}>{statut}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge
          className={`${statutColors[value] || statutColors["Prospect"]} cursor-pointer`}
          onClick={() => handleInlineEdit(contact.id, column.id, value)}
        >
          {value}
        </Badge>
      );
    }

    // Cellule source avec sélection
    if (column.id === "source") {
      return isEditing ? (
        <Select
          value={editValue}
          onValueChange={async (newValue) => {
            await onUpdate(contact.id, { source: newValue });
            setEditingField(null);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["Site web", "Référence", "LinkedIn", "Salon", "Publicité", "Autre"].map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge
          className={`${sourceColors[value] || sourceColors["Autre"]} cursor-pointer`}
          onClick={() => handleInlineEdit(contact.id, column.id, value)}
        >
          {value}
        </Badge>
      );
    }

    // Cellule date
    if (column.type === "date" && value) {
      return (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {format(new Date(value), 'dd MMM yyyy', { locale: fr })}
        </span>
      );
    }

    // Cellule nombre
    if (column.type === "number") {
      return isEditing ? (
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveInlineEdit(contact.id, column.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSaveInlineEdit(contact.id, column.id);
            if (e.key === "Escape") handleCancelInlineEdit();
          }}
          className="w-24"
          autoFocus
        />
      ) : (
        <span
          className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded"
          onClick={() => handleInlineEdit(contact.id, column.id, value)}
        >
          {column.id === "valeur_estimee" && value ? `${value.toLocaleString()} €` :
           value || "Non renseigné"}
        </span>
      );
    }

    // Cellule texte par défaut
    return isEditing ? (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => handleSaveInlineEdit(contact.id, column.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSaveInlineEdit(contact.id, column.id);
          if (e.key === "Escape") handleCancelInlineEdit();
        }}
        className="w-32"
        autoFocus
      />
    ) : (
      <span
        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 px-2 py-1 rounded block truncate"
        onClick={() => handleInlineEdit(contact.id, column.id, value)}
      >
        {value || "Non renseigné"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          {filteredContacts.length} contact{filteredContacts.length > 1 ? 's' : ''}
        </h3>
        <Button variant="outline" onClick={onColumnManager}>
          <Settings className="w-4 h-4 mr-2" />
          Colonnes
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-700/50">
              <TableHead 
                className="font-semibold relative group" 
                style={{ width: `${columnWidths.actions}px`, minWidth: `${columnWidths.actions}px` }}
              >
                Actions
                <ColumnResizer onResize={(width) => handleColumnResize('actions', width)} />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.id} 
                  className="font-semibold relative group"
                  style={{ width: `${columnWidths[column.id] || 150}px`, minWidth: `${columnWidths[column.id] || 150}px` }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.label}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => toggleColumnFilter(column.id)}
                      >
                        <Filter className="w-3 h-3" />
                      </Button>
                      {columnFilters[column.id] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => clearColumnFilter(column.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {showFilters[column.id] && (
                    <div className="absolute top-full left-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 shadow-lg mt-1">
                      <Input
                        placeholder={`Filtrer ${column.label}...`}
                        value={columnFilters[column.id] || ""}
                        onChange={(e) => handleColumnFilter(column.id, e.target.value)}
                        className="w-48"
                      />
                    </div>
                  )}
                  <ColumnResizer onResize={(width) => handleColumnResize(column.id, width)} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact, index) => (
              <motion.tr
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <TableCell style={{ width: `${columnWidths.actions}px` }}>
                  {renderCell(contact, { id: "actions" })}
                </TableCell>
                {visibleColumns.map((column) => (
                  <TableCell key={column.id} style={{ width: `${columnWidths[column.id] || 150}px` }}>
                    {renderCell(contact, column)}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredContacts.length === 0 && (
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
