// entities/User.js
export const User = {
  async me() {
    // ➝ Ici tu pourras connecter une vraie API
    return { id: "1", full_name: "Utilisateur Test", email: "test@example.com" };
  },

  async list() {
    // ➝ Simule quelques utilisateurs
    return [
      { id: "1", full_name: "Alice Martin", email: "alice@example.com" },
      { id: "2", full_name: "Bob Dupont", email: "bob@example.com" },
    ];
  },
};
