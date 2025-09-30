// entities/Interaction.js
import schema from "./interaction.json";

export const Interaction = {
  schema: () => schema,
  async create(data) {
    console.log("Interaction créée:", data);
    return { id: Date.now().toString(), ...data };
  },
  async list() {
    return [];
  },
  async filter(query, orderBy) {
    console.log("Filtrer interactions:", query, orderBy);
    return [];
  },
  async update(id, data) {
    console.log("Interaction mise à jour:", id, data);
    return { id, ...data };
  },
  async delete(id) {
    console.log("Interaction supprimée:", id);
    return true;
  }
};
