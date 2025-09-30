// entities/Rappel.js
export const Rappel = {
  async filter(filter = {}, sort = "") {
    return [];
  },

  async create(data) {
    return { id: String(Date.now()), ...data };
  },

  async update(id, data) {
    return { id, ...data };
  },

  async delete(id) {
    return true;
  },
};
