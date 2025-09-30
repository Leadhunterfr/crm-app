import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const DEFAULT_COLUMNS = [
  { id: "nom", label: "Contact", visible: true, width: "200px", type: "text" },
  { id: "societe", label: "Société", visible: true, width: "180px", type: "text" },
  { id: "email", label: "Email", visible: true, width: "220px", type: "email" },
  { id: "telephone", label: "Téléphone", visible: true, width: "150px", type: "text" },
  { id: "fonction", label: "Fonction", visible: true, width: "150px", type: "text" },
  { id: "source", label: "Source", visible: true, width: "120px", type: "select" },
  { id: "statut", label: "Statut", visible: true, width: "120px", type: "select" },
  { id: "derniere_interaction", label: "Dernière interaction", visible: true, width: "150px", type: "date" },
  { id: "valeur_estimee", label: "Valeur estimée", visible: false, width: "130px", type: "number" },
  { id: "probabilite", label: "Probabilité", visible: false, width: "110px", type: "number" },
  { id: "adresse", label: "Adresse", visible: false, width: "200px", type: "text" },
  { id: "notes", label: "Notes", visible: false, width: "150px", type: "text" }
];

export default function ColumnManager({ columns, onColumnsChange, onClose }) {
  const [localColumns, setLocalColumns] = useState(columns || DEFAULT_COLUMNS);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("text");

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalColumns(items);
  };

  const toggleColumnVisibility = (columnId) => {
    setLocalColumns(localColumns.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ));
  };

  const updateColumnLabel = (columnId, newLabel) => {
    setLocalColumns(localColumns.map(col => 
      col.id === columnId ? { ...col, label: newLabel } : col
    ));
  };

  const addCustomColumn = () => {
    if (!newColumnName.trim()) return;

    const newColumn = {
      id: `custom_${Date.now()}`,
      label: newColumnName.trim(),
      visible: true,
      width: "150px",
      type: newColumnType,
      custom: true
    };

    setLocalColumns([...localColumns, newColumn]);
    setNewColumnName("");
    setNewColumnType("text");
  };

  const removeColumn = (columnId) => {
    setLocalColumns(localColumns.filter(col => col.id !== columnId));
  };

  const handleSave = () => {
    onColumnsChange(localColumns);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gérer les colonnes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ajouter une nouvelle colonne */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-3">Ajouter une colonne personnalisée</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="columnName">Nom de la colonne</Label>
                <Input
                  id="columnName"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Ex: Budget, Secteur..."
                />
              </div>
              <div>
                <Label htmlFor="columnType">Type</Label>
                <Select value={newColumnType} onValueChange={setNewColumnType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texte</SelectItem>
                    <SelectItem value="number">Nombre</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Liste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addCustomColumn} disabled={!newColumnName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          {/* Liste des colonnes */}
          <div>
            <h3 className="font-medium mb-3">Colonnes existantes</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {localColumns.map((column, index) => (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="text-slate-400 hover:text-slate-600 cursor-grab"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleColumnVisibility(column.id)}
                              className="h-8 w-8"
                            >
                              {column.visible ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-slate-400" />
                              )}
                            </Button>

                            <div className="flex-1">
                              <Input
                                value={column.label}
                                onChange={(e) => updateColumnLabel(column.id, e.target.value)}
                                className="font-medium"
                              />
                            </div>

                            <div className="text-sm text-slate-500 w-16">
                              {column.type}
                            </div>

                            {column.custom && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeColumn(column.id)}
                                className="h-8 w-8 text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
