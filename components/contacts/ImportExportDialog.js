
import React, { useState } from "react";
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
import { Contact } from "@/entities/Contact";
import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";

export default function ImportExportDialog({ onClose, contacts, onImportComplete }) {
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Préparer les données pour l'export (uniquement les contacts filtrés)
      const exportData = contacts.map(contact => ({
        Prénom: contact.prenom,
        Nom: contact.nom,
        Société: contact.societe,
        Email: contact.email,
        Téléphone: contact.telephone,
        'Site Web': contact.site_web, // Added new field
        Source: contact.source,
        Statut: contact.statut,
        Fonction: contact.fonction,
        Adresse: contact.adresse,
        'Valeur estimée': contact.valeur_estimee,
        Température: contact.temperature,
        'Contact préféré': contact.methode_contact_preferee, // Added new field
        'Date clôture prévue': contact.date_cloture_prevue,
        Notes: contact.notes,
        'Date création': contact.created_date,
        'Dernière interaction': contact.derniere_interaction
      }));

      // Convertir en CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            JSON.stringify(row[header] || '')
          ).join(',')
        )
      ].join('\n');

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
    setExporting(false);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      // Upload du fichier
      const { file_url } = await UploadFile({ file: importFile });
      
      // Extraction des données
      const result = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            contacts: {
              type: "array",
              items: Contact.schema()
            }
          }
        }
      });

      if (result.status === "success" && result.output?.contacts) {
        // Créer les contacts
        for (const contactData of result.output.contacts) {
          await Contact.create(contactData);
        }
        
        onImportComplete();
        onClose();
      } else {
        throw new Error("Impossible d'extraire les données du fichier");
      }
    } catch (error) {
      console.error("Erreur lors de l'import:", error);
    }
    setImporting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import/Export des contacts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="text-center py-6">
              <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Exporter les contacts</h3>
              <p className="text-sm text-slate-600 mb-4">
                Téléchargez tous vos contacts au format CSV
              </p>
              <p className="text-sm text-slate-500 mb-6">
                {contacts.length} contact{contacts.length > 1 ? 's' : ''} à exporter
              </p>
              <Button 
                onClick={handleExport} 
                disabled={exporting || contacts.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Export en cours..." : "Télécharger CSV"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="text-center py-6">
              <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Importer des contacts</h3>
              <p className="text-sm text-slate-600 mb-4">
                Importez vos contacts depuis un fichier CSV ou Excel
              </p>
              
              <Alert className="text-left mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Le fichier doit contenir les colonnes : Nom, Email (obligatoires), 
                  Société, Téléphone, Site Web, Source, Statut, Contact préféré, etc.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file" className="cursor-pointer">
                    {importFile ? (
                      <div className="text-sm">
                        <p className="font-medium">{importFile.name}</p>
                        <p className="text-slate-500">Cliquez pour changer</p>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        <p>Cliquez pour sélectionner un fichier</p>
                        <p>CSV, Excel acceptés</p>
                      </div>
                    )}
                  </label>
                </div>

                <Button 
                  onClick={handleImport} 
                  disabled={importing || !importFile}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? "Import en cours..." : "Importer les contacts"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
