import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  User, 
  MessageSquare, 
  UserCheck,
  BarChart3,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const getNotificationIcon = (type) => {
  const icons = {
    contact_assigned: User,
    note_added: MessageSquare,
    status_changed: BarChart3,
    mention: Bell,
    system: Settings
  };
  return icons[type] || Bell;
};

const getNotificationColor = (type) => {
  const colors = {
    contact_assigned: "bg-blue-100 text-blue-700",
    note_added: "bg-green-100 text-green-700",
    status_changed: "bg-purple-100 text-purple-700",
    mention: "bg-orange-100 text-orange-700",
    system: "bg-gray-100 text-gray-700"
  };
  return colors[type] || "bg-gray-100 text-gray-700";
};

export default function NotificationPanel({ 
  notifications, 
  onClose, 
  onMarkAsRead, 
  onMarkAllAsRead 
}) {
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            Notifications
          </h3>
          {unreadNotifications.length > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadNotifications.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Tout marquer
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-96">
        <div className="p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Aucune notification</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg mb-2 border cursor-pointer transition-all duration-200 ${
                      notification.read 
                        ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' 
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {format(new Date(notification.created_date), 'dd MMM HH:mm', { locale: fr })}
                          </span>
                          {notification.from_user_name && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {notification.from_user_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
