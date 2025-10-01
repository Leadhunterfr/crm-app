// pages/contacts.js
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // ✅ connexion Supabase
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Composants spécifiques
import EnhancedContactTable from "@/components/contacts/EnhancedContactTable";
import ContactForm from "@/components/contacts/ContactForm";
import ContactDetails from "@/components/contacts/ContactDetails";
import ContactFilters from "@/components/contacts/ContactFilters";
import ImportExportDialog from "@/components/contacts/ImportExportDialog";
import ColumnManager from "@/components/contacts/ColumnManager";
import ChatSidebar from "@/components/contacts/ChatSidebar";

// Colonnes par défaut
const DEFAULT_COLUMNS = [
  { id: "prenom", label: "Prénom", visible: true, width: "150px" },
  { id: "nom", label: "Nom", visible: true, width: "150px" },
  { id: "societe", label: "Société", visible: true, width: "180px" },
  { id: "email", label: "Email", visible: true, width: "220px" },
  { id: "telephone", label: "Téléphone", visible: true, width: "150px" },
  { id: "statut", label: "Statut", visible: true, width: "120px" },
  { id: "source", label: "Source", visible: true, width: "120px" },
  { id: "temperature", label: "Température", visible: true, width: "120px" },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  // Recherche & filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ statut: "tous", source: "tous" });

  // Colonnes visibles
  const [columns, setColumns] = useState(() => {
    const saved =
      typeof window !== "undefined" &&
      localStorage.getItem("contacts-columns");
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });

  // 🔹 Charger les contacts depuis Supabase
  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("updated_date", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des contacts:", error);
    }
    setLoading(false);
  };

  // 🔹 Filtrage des contacts
  const applyFilters = React.useCallback(() => {
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

    if (filters.statut !== "tous") {
      filtered = filtered.filter((c) => c.statut === filters.statut);
    }

    if (filters.source !== "tous") {
      filtered = filtered.filter((c) => c.source === filters.source);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, filters]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 🔹 CRUD Supabase
  const handleCreateContact = async (contactData) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .insert([
          {
            ...contactData,
            updated_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Créer une interaction liée
      await supabase.from("interactions").insert([
        {
          contact_id: data.id,
          type: "Note",
          description: "Contact créé",
          date_interaction: new Date().toISOString(),
          org_id: data.org_id,
        },
      ]);

      setContacts([data, ...contacts]);
      setShowContactForm(false);
    } catch (error) {
      console.error("Erreur création:", error);
    }
  };

  const handleUpdateContact = async (contactId, updates) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          ...updates,
          updated_date: new Date().toISOString(),
        })
        .eq("id", contactId);

      if (error) throw error;

      setContacts(
        contacts.map((c) =>
          c.id === contactId ? { ...c, ...updates } : c
        )
      );
      setEditingContact(null);
    } catch (error) {
      console.error("Erreur update:", error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (confirm("Supprimer ce contact ?")) {
      try {
        const { error } = await supabase
          .from("contacts")
          .delete()
          .eq("id", contactId);

        if (error) throw error;

        setContacts(contacts.filter((c) => c.id !== contactId));
      } catch (error) {
        console.error("Erreur suppression:", error);
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Contacts
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gérez vos contacts et prospects
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowImportExport(true)}>
              <Upload className="w-4 h-4 mr-2" /> Import/Export
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowContactForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Nouveau contact
            </Button>
          </div>
        </div>

        {/* Barre recherche + filtres */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ContactFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border">
          <EnhancedContactTable
            contacts={filteredContacts}
            loading={loading}
            onView={(contact) => {
              setSelectedContact(contact);
              setShowContactDetails(true);
            }}
            onEdit={setEditingContact}
            onDelete={handleDeleteContact}
            onUpdate={handleUpdateContact}
            onOpenChat={(c) => {
              setShowChatSidebar(true);
              setSelectedContact(c);
            }}
            columns={columns}
            onColumnManager={() => setShowColumnManager(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showContactForm && (
          <ContactForm
            onClose={() => setShowContactForm(false)}
            onSave={handleCreateContact}
          />
        )}
        {editingContact && (
          <ContactForm
            contact={editingContact}
            onClose={() => setEditingContact(null)}
            onSave={(data) => handleUpdateContact(editingContact.id, data)}
          />
        )}
        {selectedContact && showContactDetails && (
          <ContactDetails
            contact={selectedContact}
            onClose={() => {
              setShowContactDetails(false);
              setSelectedContact(null);
            }}
            onEdit={() => {
              setEditingContact(selectedContact);
              setShowContactDetails(false);
            }}
            onDelete={handleDeleteContact}
          />
        )}
        {showImportExport && (
          <ImportExportDialog
            onClose={() => setShowImportExport(false)}
            contacts={filteredContacts}
            onImportComplete={loadContacts}
          />
        )}
        {showColumnManager && (
          <ColumnManager
            columns={columns}
            onColumnsChange={(cols) => {
              setColumns(cols);
              localStorage.setItem(
                "contacts-columns",
                JSON.stringify(cols)
              );
            }}
            onClose={() => setShowColumnManager(false)}
          />
        )}
        {showChatSidebar && selectedContact && (
          <ChatSidebar
            contact={selectedContact}
            onClose={() => setShowChatSidebar(false)}
            onInteractionAdded={loadContacts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
