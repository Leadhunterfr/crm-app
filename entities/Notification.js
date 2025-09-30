// entities/Notification.js
export const Notification = {
  async create(data) {
    return { id: String(Date.now()), read: false, ...data };
  },
};
