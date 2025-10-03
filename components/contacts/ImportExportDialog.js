// components/contacts/ImportExportDialog.js
"use client";
import React, { useState, useEffect  } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";

export default function ImportExportDialog({ onClose, contacts, currentUser, onImportComplete }) {
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mapping, setMapping] = useState({});
  const [rawColumns, setRawColumns] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [step, setStep] = useState("upload"); // upload | mapping

  const supabaseFields = ["prenom", "nom", "societe", "email", "telephone", "statut", "source", "temperature"];

  const [currentUserState, setCurrentUserState] = useState(currentUser || null);

  useEffect(() => {
    if (!currentUser) {
      const loadUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error) setCurrentUserState(user);
      };
      loadUser();
    }
  }, [currentUser]);


  // 🔹 Export
  const handleExport = async (format = "csv") => {
    setExporting(true);
    try {
      const exportData = contacts.map(c => ({
        prenom: c.prenom,
        nom: c.nom,
        societe: c.societe,
        email: c.email,
        telephone: c.telephone,
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
    }
    setExporting(false);
  };

  // 🔹 Import parsing
  const handleFileUpload = (file) => {
    setImportFile(file);
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setRawColumns(Object.keys(results.data[0] || {}));
          setRawData(results.data);
          setStep("mapping");
        },
      });
    } else if (file.name.endsWith(".xlsx")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        setRawColumns(json[0]);
        setRawData(json.slice(1).map((row) => {
          let obj = {};
          json[0].forEach((col, i) => (obj[col] = row[i]));
          return obj;
        }));
        setStep("mapping");
      };
      reader.readAsBinaryString(file);
    }
  };

  // 🔹 Import insertion
  const handleConfirmMapping = async () => {
    setImporting(true);
    try {
      const mappedContacts = rawData
        .filter((r) => r[mapping["nom"]] && r[mapping["email"]])
        .map((r) => {
          let obj = {};
          Object.entries(mapping).forEach(([field, csvCol]) => {
            obj[field] = r[csvCol] || "";
          });
          obj.org_id = currentUserState?.user_metadata?.org_id || null;
          obj.user_id = currentUserState?.id || null;
          return obj;
        });

      if (mappedContacts.length > 0) {
        const { error } = await supabase.from("contacts").insert(mappedContacts);
        if (error) throw error;
      }
      if (onImportComplete) onImportComplete();
      onClose();
    } catch (err) {
      console.error("Erreur import:", err);
    }
    setImporting(false);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import/Export des contacts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          {/* EXPORT */}
          <TabsContent value="export" className="space-y-4">
            <div className="text-center py-6">
              <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Exporter les contacts</h3>
              <p className="text-sm text-slate-600 mb-4">
                {contacts.length} contact{contacts.length > 1 ? "s" : ""} à exporter
              </p>
              <div className="flex gap-3">
                <Button onClick={() => handleExport("csv")} disabled={exporting}>
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
                <Button onClick={() => handleExport("xlsx")} disabled={exporting}>
                  <Download className="w-4 h-4 mr-2" /> Excel
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* IMPORT */}
          <TabsContent value="import" className="space-y-4">
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
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" onClick={() => setStep("upload")}>
                    Annuler
                  </Button>
                  <Button onClick={() => handleConfirmMapping()} disabled={importing}>
                    {importing ? "Import..." : "Confirmer"}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
