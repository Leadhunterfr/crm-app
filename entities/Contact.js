// entities/Contact.js
import schema from "./contact.json";

export const Contact = {
  schema: () => schema,
  async create(data) {
    console.log("Contact créé:", data);
    return { id: Date.now().toString(), ...data };
  },
  async list() {
    return [];
  },
  async filter() {
    return [];
  },
  async update(id, data) {
    console.log("Contact mis à jour:", id, data);
    return { id, ...data };
  },
  async delete(id) {
    console.log("Contact supprimé:", id);
    return true;
  }
};
