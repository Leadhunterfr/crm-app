// integrations/Core.js

export const Core = {
  importContacts: async (file) => {
    console.log("Import non implémenté. Fichier reçu :", file);
    return [];
  },

  exportContacts: async (contacts, format = "csv") => {
    console.log("Export non implémenté. Format :", format);
    return null;
  },

  syncWithCRM: async () => {
    console.log("Sync CRM non implémentée.");
    return true;
  }
};
