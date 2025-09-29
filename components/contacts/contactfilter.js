import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function ContactFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (type, value) => {
    onFiltersChange({
      ...filters,
      [type]: value
    });
  };

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select 
          value={filters.statut} 
          onValueChange={(value) => handleFilterChange("statut", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="Prospect">Prospect</SelectItem>
            <SelectItem value="Contacté">Contacté</SelectItem>
            <SelectItem value="Qualifié">Qualifié</SelectItem>
            <SelectItem value="Proposition">Proposition</SelectItem>
            <SelectItem value="Négociation">Négociation</SelectItem>
            <SelectItem value="Client">Client</SelectItem>
            <SelectItem value="Perdu">Perdu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select 
          value={filters.source} 
          onValueChange={(value) => handleFilterChange("source", value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Toutes sources</SelectItem>
            <SelectItem value="Site web">Site web</SelectItem>
            <SelectItem value="Référence">Référence</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Salon">Salon</SelectItem>
            <SelectItem value="Publicité">Publicité</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
