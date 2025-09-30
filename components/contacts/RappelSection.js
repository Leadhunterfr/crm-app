
import React, { useState, useEffect, useCallback } from "react";
import { Rappel } from "@/entities/Rappel";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Plus, Trash2, Calendar, Phone, Mail, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function RappelSection({ contact }) {
  const [rappels, setRappels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newRappel, setNewRappel] = useState({
    type: "Appel",
    date_rappel: new Date().toISOString().slice(0, 16),
    note: ""
  });
  const [currentUser, setCurrentUser] = useState(null);

  const loadRappels = useCallback(async () => {
    const data = await Rappel.filter({ contact_id: contact.id }, "-date_rappel");
    setRappels(data);
  }, [contact.id]);

  const loadCurrentUser = async () => {
    const user = await User.me();
    setCurrentUser(user);
  };

  useEffect(() => {
    loadCurrentUser();
    loadRappels();
  }, [contact.id, loadRappels]);


  const handleAddRappel = async () => {
    if (!currentUser) return;
    
    await Rappel.create({
      ...newRappel,
      contact_id: contact.id,
      user_id: currentUser.id,
      date_rappel: new Date(newRappel.date_rappel).toISOString()
    });
    
    setShowForm(false);
    setNewRappel({
      type: "Appel",
      date_rappel: new Date().toISOString().slice(0, 16),
      note: ""
    });
    loadRappels();
  };

  const handleToggleComplete = async (rappel) => {
    await Rappel.update(rappel.id, { completed: !rappel.completed });
    loadRappels();
  };

  const handleDeleteRappel = async (rappelId) => {
    await Rappel.delete(rappelId);
    loadRappels();
  };

  const getIcon = (type) => {
    if (type === "Appel") return <Phone className="w-4 h-4" />;
    if (type === "Email") return <Mail className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold flex items-center gap-2"><Bell className="w-5 h-5"/> Rappels</h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter
        </Button>
      </div>

      {showForm && (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-4 space-y-3">
          <Select value={newRappel.type} onValueChange={v => setNewRappel({...newRappel, type: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Appel">Appel</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="datetime-local"
            value={newRappel.date_rappel}
            onChange={e => setNewRappel({...newRappel, date_rappel: e.target.value})}
          />
          <Textarea 
            placeholder="Note pour le rappel..."
            value={newRappel.note}
            onChange={e => setNewRappel({...newRappel, note: e.target.value})}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleAddRappel}>Enregistrer</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rappels.length === 0 && !showForm && (
          <p className="text-sm text-slate-500 text-center py-4">Aucun rappel programmé.</p>
        )}
        {rappels.map(rappel => (
          <div key={rappel.id} className={`flex items-start gap-3 p-3 rounded-lg ${rappel.completed ? 'bg-slate-100 dark:bg-slate-800' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
            <Checkbox
              checked={rappel.completed}
              onCheckedChange={() => handleToggleComplete(rappel)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className={`font-medium ${rappel.completed ? 'line-through text-slate-500' : ''}`}>
                {rappel.note || `Rappel de type ${rappel.type}`}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(rappel.date_rappel), 'dd MMM yyyy HH:mm', {locale: fr})}
                </span>
                <span className="flex items-center gap-1">
                  {getIcon(rappel.type)}
                  {rappel.type}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteRappel(rappel.id)}>
              <Trash2 className="w-4 h-4 text-red-500"/>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
