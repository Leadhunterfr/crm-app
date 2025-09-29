
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Users, 
  AtSign,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Interaction } from "@/entities/Interaction";
import { User } from "@/entities/User";
import { Notification } from "@/entities/Notification";

export default function InternalNotesSection({ contact }) {
  const [internalNotes, setInternalNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const users = await User.list();
      setAllUsers(users);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
  };

  const loadInternalNotes = useCallback(async () => {
    try {
      const notes = await Interaction.filter(
        { 
          contact_id: contact.id, 
          type: "NoteInterne" 
        }, 
        "-date_interaction"
      );
      setInternalNotes(notes);
    } catch (error) {
      console.error("Erreur lors du chargement des notes:", error);
    }
    setLoading(false);
  }, [contact.id]);

  useEffect(() => {
    loadCurrentUser();
    loadAllUsers();
    loadInternalNotes();
    
    // Polling pour les nouvelles notes (toutes les 15 secondes)
    const interval = setInterval(loadInternalNotes, 15000);
    return () => clearInterval(interval);
  }, [loadInternalNotes]);

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const user = allUsers.find(u => 
        u.full_name?.toLowerCase().includes(username.toLowerCase()) ||
        u.email?.toLowerCase().includes(username.toLowerCase())
      );
      if (user) {
        mentions.push(user.id);
      }
    }
    
    return mentions;
  };

  const createNotificationsForMentions = async (mentions, noteId) => {
    for (const userId of mentions) {
      const user = allUsers.find(u => u.id === userId);
      if (user && userId !== currentUser.id) {
        await Notification.create({
          user_id: userId,
          user_name: user.full_name,
          title: "Vous avez été mentionné",
          message: `${currentUser.full_name} vous a mentionné dans une note sur ${contact.nom}`,
          type: "mention",
          contact_id: contact.id,
          from_user_id: currentUser.id,
          from_user_name: currentUser.full_name
        });
      }
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || sending) return;

    setSending(true);
    try {
      const mentions = extractMentions(newNote);
      
      const noteData = {
        contact_id: contact.id,
        type: "NoteInterne",
        description: newNote,
        date_interaction: new Date().toISOString(),
        created_by_user_name: currentUser.full_name,
        mentions: mentions,
        internal: true
      };

      const createdNote = await Interaction.create(noteData);
      
      // Créer des notifications pour les mentions
      await createNotificationsForMentions(mentions, createdNote.id);
      
      // Notifier le propriétaire du contact si ce n'est pas la même personne
      if (contact.assigned_to_user_id && 
          contact.assigned_to_user_id !== currentUser.id && 
          !mentions.includes(contact.assigned_to_user_id)) {
        await Notification.create({
          user_id: contact.assigned_to_user_id,
          user_name: contact.assigned_to_user_name,
          title: "Nouvelle note interne",
          message: `${currentUser.full_name} a ajouté une note sur ${contact.nom}`,
          type: "note_added",
          contact_id: contact.id,
          from_user_id: currentUser.id,
          from_user_name: currentUser.full_name
        });
      }

      setInternalNotes([createdNote, ...internalNotes]);
      setNewNote("");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note:", error);
    }
    setSending(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewNote(value);
    
    // Vérifier les mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const mentionText = value.slice(lastAtIndex + 1);
      if (mentionText && !mentionText.includes(' ')) {
        setMentionQuery(mentionText);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const lastAtIndex = newNote.lastIndexOf('@');
    const beforeMention = newNote.slice(0, lastAtIndex);
    const afterMention = newNote.slice(newNote.length);
    setNewNote(`${beforeMention}@${user.full_name} ${afterMention}`);
    setShowMentions(false);
  };

  const filteredUsers = allUsers.filter(user => 
    user.id !== currentUser?.id &&
    (user.full_name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
     user.email?.toLowerCase().includes(mentionQuery.toLowerCase()))
  );

  const renderNoteContent = (content) => {
    return content.replace(/@(\w+)/g, (match, username) => {
      const user = allUsers.find(u => 
        u.full_name?.toLowerCase().includes(username.toLowerCase())
      );
      return user ? `<span class="text-blue-600 font-medium">@${user.full_name}</span>` : match;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        <h3 className="font-medium text-slate-900">Notes internes</h3>
        <Badge variant="secondary">{internalNotes.length}</Badge>
      </div>

      {/* Formulaire pour nouvelle note */}
      <form onSubmit={handleSubmitNote} className="relative">
        <div className="relative">
          <Textarea
            value={newNote}
            onChange={handleInputChange}
            placeholder="Ajouter une note interne... (utilisez @nom pour mentionner un collègue)"
            rows={3}
            className="pr-12 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newNote.trim() || sending}
            className="absolute bottom-2 right-2 h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestions de mentions */}
        {showMentions && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
          >
            {filteredUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => insertMention(user)}
                className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 text-left"
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </form>

      {/* Liste des notes */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {internalNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {note.created_by_user_name ? 
                    note.created_by_user_name.split(' ').map(n => n[0]).join('') : 
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-slate-900">
                    {note.created_by_user_name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {format(new Date(note.date_interaction), 'dd MMM HH:mm', { locale: fr })}
                  </div>
                </div>
                <div 
                  className="text-sm text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: renderNoteContent(note.description) 
                  }}
                />
                {note.mentions && note.mentions.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <AtSign className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {note.mentions.length} mention{note.mentions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {internalNotes.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Aucune note interne pour le moment</p>
            <p className="text-xs text-slate-400 mt-1">
              Ajoutez la première note pour commencer la collaboration
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
