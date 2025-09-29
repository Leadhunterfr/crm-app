import React, { useState, useEffect, useCallback } from "react";
import { Contact } from "@/entities/Contact";
import { Interaction } from "@/entities/Interaction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Mail,
  Building2,
  DollarSign,
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  MessageSquare,
  Flame,
  Snowflake,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import ContactDetails from "@/components/contacts/ContactDetails";
import QuickInteractionDialog from "@/components/pipeline/QuickInteractionDialog";

// 🔹 Étapes du pipeline
const PIPELINE_STAGES = [
  { id: "Prospect", name: "Prospects", color: "bg-yellow-500", count: 0 },
  { id: "Contacté", name: "Contactés", color: "bg-blue-500", count: 0 },
  { id: "Qualifié", name: "Qualifiés", color: "bg-purple-500", count: 0 },
  { id: "Proposition", name: "Propositions", color: "bg-orange-500", count: 0 },
  { id: "Négociation", name: "Négociations", color: "bg-indigo-500", count: 0 },
  { id: "Client", name: "Clients", color: "bg-green-500", count: 0 },
  { id: "Perdu", name: "Perdus", color: "bg-red-500", count: 0 },
];

// 🔹 Couleurs / icônes de température
const temperatureColors = {
  Chaud: "bg-red-500",
  Tiède: "bg-orange-500",
  Froid: "bg-blue-500",
};

const temperatureIcons = {
  Chaud: <Flame className="w-3 h-3" />,
  Tiède: <TrendingUp className="w-3 h-3" />,
  Froid: <Snowflake className="w-3 h-3" />,
};

export default function PipelinePage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [stages, setStages] = useState(PIPELINE_STAGES);

  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [showQuickInteraction, setShowQuickInteraction] = useState(false);
  const [interactionContact, setInteractionContact] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState("tous");

  // 🔹 Charger contacts
  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await Contact.list("-updated_date");
      setContacts(data);
    } catch (error) {
      console.error("Erreur chargement contacts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // 🔹 Filtrage
  const applyFilters = useCallback(() => {
    let filtered = [...contacts];

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          `${c.prenom || ""} ${c.nom || ""}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          c.societe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (temperatureFilter !== "tous") {
      filtered = filtered.filter((c) => c.temperature === temperatureFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, temperatureFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 🔹 Mettre à jour les compteurs de colonnes
  const updateStageCounts = useCallback(() => {
    const updatedStages = PIPELINE_STAGES.map((stage) => ({
      ...stage,
      count: filteredContacts.filter((c) => c.statut === stage.id).length,
    }));
    setStages(updatedStages);
  }, [filteredContacts]);

  useEffect(() => {
    updateStageCounts();
  }, [updateStageCounts]);

  // 🔹 Changer statut
  const handleStatusChange = async (contactId, newStatus) => {
    try {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      await Contact.update(contactId, {
        statut: newStatus,
        derniere_interaction: new Date().toISOString(),
      });

      await Interaction.create({
        contact_id: contactId,
        type: "Modification",
        description: `Contact déplacé de "${contact.statut}" vers "${newStatus}"`,
        date_interaction: new Date().toISOString(),
      });

      setContacts(
        contacts.map((c) =>
          c.id === contactId ? { ...c, statut: newStatus } : c
        )
      );
    } catch (error) {
      console.error("Erreur changement statut:", error);
    }
  };

  // 🔹 Valeur totale
  const getTotalValue = () =>
    filteredContacts
      .filter((c) => c.statut !== "Perdu")
      .reduce((sum, c) => sum + (c.valeur_estimee || 0), 0);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Pipeline de vente
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visualisez et gérez vos opportunités par étape
          </p>
        </div>

        {/* Métriques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-sm text-slate-600">Total contacts</p>
                <p className="text-2xl font-bold">{filteredContacts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex justify-between">
              <div>
                <p className="text-sm text-slate-600">Valeur totale</p>
                <p className="text-2xl font-bold">
                  {getTotalValue().toLocaleString()} €
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, société, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Température" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes</SelectItem>
                <SelectItem value="Chaud">🔥 Chaud</SelectItem>
                <SelectItem value="Tiède">🔶 Tiède</SelectItem>
                <SelectItem value="Froid">❄️ Froid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pipeline */}
        <div className="space-y-8">
          {stages.map((stage) => {
            const stageContacts = filteredContacts.filter(
              (c) => c.statut === stage.id
            );

            return (
              <Card key={stage.id}>
                <div className="p-4 border-b flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${stage.color} rounded-full`} />
                    <h3 className="font-semibold">{stage.name}</h3>
                    <Badge variant="secondary">{stage.count}</Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    Valeur:{" "}
                    {stageContacts
                      .reduce((sum, c) => sum + (c.valeur_estimee || 0), 0)
                      .toLocaleString()}{" "}
                    €
                  </div>
                </div>

                <CardContent className="p-4">
                  {stageContacts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Aucun contact</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stageContacts.map((c, index) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-4 hover:shadow-md">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">
                                  {c.prenom} {c.nom}
                                </h4>
                                {c.societe && (
                                  <p className="text-xs text-slate-500">
                                    {c.societe}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedContact(c);
                                    setShowDetails(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setInteractionContact(c);
                                    setShowQuickInteraction(true);
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-sm text-slate-600 mb-2">
                              {c.email}
                            </div>

                            {c.valeur_estimee && (
                              <div className="flex justify-between mb-2">
                                <span className="font-medium text-green-600">
                                  {c.valeur_estimee.toLocaleString()} €
                                </span>
                                {c.temperature && (
                                  <Badge
                                    className={`${
                                      temperatureColors[c.temperature]
                                    } text-white flex items-center gap-1`}
                                  >
                                    {temperatureIcons[c.temperature]}
                                    {c.temperature}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Actions statut rapides */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {PIPELINE_STAGES.filter(
                                (s) => s.id !== c.statut
                              )
                                .slice(0, 3)
                                .map((target) => (
                                  <Button
                                    key={target.id}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() =>
                                      handleStatusChange(c.id, target.id)
                                    }
                                  >
                                    → {target.name}
                                  </Button>
                                ))}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetails && selectedContact && (
          <ContactDetails
            contact={selectedContact}
            onClose={() => setShowDetails(false)}
            onDelete={() => {
              setContacts(contacts.filter((c) => c.id !== selectedContact.id));
              setShowDetails(false);
            }}
          />
        )}

        {showQuickInteraction && interactionContact && (
          <QuickInteractionDialog
            contact={interactionContact}
            onClose={() => setShowQuickInteraction(false)}
            onInteractionAdded={() => {
              setShowQuickInteraction(false);
              loadContacts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
