"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Download, FileSpreadsheet, X } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";

export default function ImportExportDialog({ onClose, contacts, currentUser, onImportComplete }) {
  const [open, setOpen] = useState(true);
  const [view, setView] = useState("export");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mapping, setMapping] = useState({});
  const [rawColumns, setRawColumns] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [step, setStep] = useState("upload");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ nouveaux champs ajoutés
  const supabaseFields = [
    "prenom",
    "nom",
    "societe",
    "email",
    "telephone",
    "adresse",
    "site_web",
    "linkedin",
    "statut",
    "source",
    "temperature",
  ];

  const [currentUserState, setCurrentUserState] = useState(currentUser || null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        // récupérer org_id dans user_profiles
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("org_id")
          .eq("id", user.id)
          .single();
  
        if (!profileError) {
          setCurrentUserState({
            ...user,
            org_id: profile?.org_id || null
          });
          console.log("🔑 org_id chargé:", profile?.org_id);
        } else {
          console.error("Erreur chargement org_id:", profileError);
          setCurrentUserState(user); // fallback sans org_id
        }
      }
    };
    if (!currentUser) loadUser();
  }, [currentUser]);


  // ---------------- EXPORT ----------------
  const handleExport = (format) => {
    setExporting(true);
    try {
      const exportData = contacts.map((c) => ({
        prenom: c.prenom,
        nom: c.nom,
        societe: c.societe,
        email: c.email,
        telephone: c.telephone,
        adresse: c.adresse,
        site_web: c.site_web,
        linkedin: c.linkedin,
        source: c.source,
        statut: c.statut,
        temperature: c.temperature,
      }));

      if (format === "csv") {
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
      } else {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contacts");
        XLSX.writeFile(wb, `contacts-${new Date().toISOString().split("T")[0]}.xlsx`);
      }
    } catch (err) {
      console.error("Erreur export:", err);
    } finally {
      setExporting(false);
    }
  };

  // ---------------- IMPORT (parsing) ----------------
  const handleFileUpload = (file) => {
    console.log("📂 handleFileUpload CALLED with file:", file?.name);
    if (!file) return;
  
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("📊 Parsed CSV:", results.data.slice(0, 5));
          setRawColumns(Object.keys(results.data[0] || {}));
          setRawData(results.data);
          setStep("mapping"); // <-- log ici
          console.log("✅ Step set to mapping");
        },
      });
    } else if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        console.log("📊 Parsed XLSX:", json.slice(0, 5));
        setRawColumns(json[0]);
        setRawData(
          json.slice(1).map((row) => {
            let obj = {};
            json[0].forEach((col, i) => (obj[col] = row[i]));
            return obj;
          })
        );
        setStep("mapping");
        console.log("✅ Step set to mapping");
      };
      reader.readAsBinaryString(file);
    }
  };


  // ---------------- IMPORT (insertion) ----------------
  const handleConfirmMapping = async () => {
    console.log("🚀 handleConfirmMapping CALLED");
    setImporting(true);
    setErrorMsg("");
    try {
      console.log("📊 Raw data:", rawData.slice(0, 5));
      console.log("🗺 Mapping:", mapping);
      console.log("👤 currentUserState:", currentUserState);
      
      const mappedContacts = rawData
        .filter((r) => {
          // on garde la ligne si au moins "societe" OU "email" est rempli
          return r[mapping["societe"]] || r[mapping["email"]];
        })
        .map((r) => {
          let obj = {};
          Object.entries(mapping).forEach(([field, csvCol]) => {
            obj[field] = r[csvCol] || "";
          });
          obj.org_id = currentUserState?.org_id || null;
          obj.user_id = currentUserState?.id || null;
          return obj;
        });

      if (mappedContacts.length === 0) {
        setErrorMsg("⚠️ Aucun contact valide n’a été trouvé. Vérifie ton mapping (au moins Email ou Société).");
        setImporting(false);
        return;
      }

  
      if (mappedContacts.length > 0) {
        const { data, error } = await supabase.from("contacts").insert(mappedContacts);
        console.log("📤 Supabase response:", { data, error });
        if (error) throw error;
      }
      if (onImportComplete) onImportComplete();
      setOpen(false);
      onClose();
    } catch (err) {
      console.error("Erreur import:", err);
      setErrorMsg(err.message || "Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };


  // ---------------- RENDER ----------------
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Import/Export des contacts</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        {/* Switch export / import */}
        <div className="flex gap-4 justify-center mb-6">
          <Button
            variant={view === "export" ? "default" : "outline"}
            onClick={() => setView("export")}
          >
            Export
          </Button>
          <Button
            variant={view === "import" ? "default" : "outline"}
            onClick={() => setView("import")}
          >
            Import
          </Button>
        </div>

        {/* EXPORT */}
        {view === "export" && (
          <div className="text-center py-6">
            <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Exporter les contacts</h3>
            <p className="text-sm text-slate-600 mb-4">
              {contacts.length} contact{contacts.length > 1 ? "s" : ""} à exporter
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleExport("csv")} disabled={exporting} className="bg-green-600 text-white">
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button onClick={() => handleExport("xlsx")} disabled={exporting} className="bg-yellow-600 text-white">
                <Download className="w-4 h-4 mr-2" /> Excel
              </Button>
            </div>
          </div>
        )}

        {/* IMPORT */}
        {view === "import" && (
          <div className="space-y-4">
            {step === "upload" && (
              <div className="text-center py-6">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Importer des contacts</h3>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="mt-4"
                />
              </div>
            )}

            {step === "mapping" && (
              <div>
                <h3 className="font-medium mb-4">Faites correspondre les colonnes</h3>
                {supabaseFields.map((field) => (
                  <div key={field} className="flex gap-3 items-center mb-2">
                    <span className="w-40 font-medium">{field}</span>
                    <select
                      className="border rounded p-1 flex-1"
                      value={mapping[field] || ""}
                      onChange={(e) =>
                        setMapping((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                    >
                      <option value="">-- Ne pas importer --</option>
                      {rawColumns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" onClick={() => setStep("upload")}>
                    Annuler
                  </Button>
                  <Button onClick={handleConfirmMapping} disabled={importing}>
                    {importing ? "Import..." : "Confirmer"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
