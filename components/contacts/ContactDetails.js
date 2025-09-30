
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Clock,
  MessageSquare,
  Flame,
  Snowflake,
  Bell,
  Globe,
  MessageCircle,
  Linkedin
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Interaction } from "@/entities/Interaction";

import InternalNotesSection from "./InternalNotesSection";
import RappelSection from "./RappelSection";
import ChatSidebar from "./ChatSidebar";

export default function ContactDetails({ contact, onClose, onEdit, onDelete }) {
  const [interactions, setInteractions] = useState([]);
  const [loadingInteractions, setLoadingInteractions] = useState(true);
  const [showChatSidebar, setShowChatSidebar] = useState(false);

  const loadInteractions = React.useCallback(async () => {
    setLoadingInteractions(true);
    try {
      const data = await Interaction.filter(
        { 
          contact_id: contact.id,
          type: { $ne: "NoteInterne" }
        }, 
        "-date_interaction"
      );
      setInteractions(data);
    } catch (error) {
      console.error("Erreur lors du chargement des interactions:", error);
    }
    setLoadingInteractions(false);
  }, [contact.id]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  const getStatutColor = (statut) => {
    const colors = {
      "Prospect": "bg-yellow-100 text-yellow-800",
      "Contacté": "bg-blue-100 text-blue-800",
      "Qualifié": "bg-purple-100 text-purple-800",
      "Proposition": "bg-orange-100 text-orange-800",
      "Négociation": "bg-indigo-100 text-indigo-800",
      "Client": "bg-green-100 text-green-800",
      "Perdu": "bg-red-100 text-red-800"
    };
    return colors[statut] || colors["Prospect"];
  };

  const getInteractionIcon = (type) => {
    const icons = {
      "Appel": Phone,
      "Email": Mail,
      "LinkedIn": Linkedin,
      "Réunion": Calendar,
      "Note": MessageSquare,
      "Modification": Edit
    };
    return icons[type] || MessageSquare;
  };
  
  const getTemperatureStyle = (temperature) => {
    const styles = {
      Chaud: { icon: Flame, color: "text-red-600", label: "Chaud" },
      Tiède: { icon: TrendingUp, color: "text-orange-600", label: "Tiède" },
      Froid: { icon: Snowflake, color: "text-blue-600", label: "Froid" }
    };
    return styles[temperature] || { icon: TrendingUp, color: "text-slate-600", label: temperature };
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {contact.prenom ? contact.prenom.charAt(0).toUpperCase() : 
                   contact.nom ? contact.nom.charAt(0).toUpperCase() : "?"}
                  {contact.nom && contact.prenom ? contact.nom.charAt(0).toUpperCase() : ""}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {contact.prenom && contact.nom ? `${contact.prenom} ${contact.nom}` : 
                     contact.nom || "Contact sans nom"}
                  </h2>
                  {contact.fonction && (
                    <p className="text-sm text-slate-600">{contact.fonction}</p>
                  )}
                  {contact.assigned_to_user_name && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Assigné à {contact.assigned_to_user_name}
                    </p>
                  )}
                </div>
              </DialogTitle>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowChatSidebar(true)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat & Tâches
                </Button>
                <Button variant="outline" onClick={() => onEdit(contact)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onDelete(contact.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Détails du contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations de contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Société</p>
                        <p className="font-medium">{contact.societe || "Non renseignée"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <a 
                          href={`mailto:${contact.email}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600">Téléphone</p>
                        {contact.telephone ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{contact.telephone}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-green-100"
                              onClick={() => window.open(`tel:${contact.telephone}`)}
                              title="Appeler ce numéro"
                            >
                              <Phone className="w-3 h-3 text-green-600"/>
                            </Button>
                          </div>
                        ) : (
                          <p className="font-medium text-slate-400">Non renseigné</p>
                        )}
                      </div>
                    </div>
                    
                    {contact.site_web && (
                       <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600">Site Web</p>
                          <a 
                            href={contact.site_web.startsWith('http') ? contact.site_web : `https://${contact.site_web}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {contact.site_web}
                            <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {contact.linkedin && (
                       <div className="flex items-center gap-3">
                        <Linkedin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600">LinkedIn</p>
                          <a 
                            href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://linkedin.com/in/${contact.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {contact.linkedin}
                            <Linkedin className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {contact.adresse && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600">Adresse</p>
                          <p className="font-medium">{contact.adresse}</p>
                        </div>
                      </div>
                    )}
                    
                    {contact.methode_contact_preferee && contact.methode_contact_preferee !== 'Non spécifié' && (
                       <div className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600">Contact préféré</p>
                          <p className="font-medium">{contact.methode_contact_preferee}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Tag className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {contact.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {contact.notes && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-1" />
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Notes</p>
                        <p className="text-sm leading-relaxed">{contact.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historique des interactions publiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Historique des interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingInteractions ? (
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : interactions.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">
                      Aucune interaction enregistrée
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {interactions.map((interaction, index) => {
                        const Icon = getInteractionIcon(interaction.type);
                        return (
                          <motion.div
                            key={interaction.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3 p-3 bg-slate-50 rounded-lg"
                          >
                            <Icon className="w-4 h-4 text-slate-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <Badge variant="outline">{interaction.type}</Badge>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(interaction.date_interaction), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                </span>
                              </div>
                              <p className="text-sm">{interaction.description}</p>
                              {interaction.statut_precedent && interaction.statut_actuel && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Statut: {interaction.statut_precedent} → {interaction.statut_actuel}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes internes - Nouvelle section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Communication interne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InternalNotesSection contact={contact} />
                </CardContent>
              </Card>
            </div>

            {/* Panneau latéral */}
            <div className="space-y-6">
              {/* Statut et métriques */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge className={`${getStatutColor(contact.statut)} text-sm`}>
                    {contact.statut}
                  </Badge>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Source:</span>
                      <Badge variant="outline">{contact.source}</Badge>
                    </div>
                    
                    {contact.derniere_interaction && (
                      <div>
                        <span className="text-sm text-slate-600">Dernière interaction:</span>
                        <p className="text-sm font-medium">
                          {format(new Date(contact.derniere_interaction), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Opportunité */}
              {(contact.valeur_estimee || contact.temperature || contact.date_cloture_prevue) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Opportunité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {contact.valeur_estimee && (
                      <div>
                        <span className="text-sm text-slate-600">Valeur estimée:</span>
                        <p className="text-lg font-bold text-green-600">
                          {contact.valeur_estimee.toLocaleString()} €
                        </p>
                      </div>
                    )}
                    
                    {contact.temperature && (() => {
                        const tempStyle = getTemperatureStyle(contact.temperature);
                        const Icon = tempStyle.icon;
                        return (
                          <div>
                            <span className="text-sm text-slate-600">Température:</span>
                            <div className={`flex items-center gap-2 ${tempStyle.color}`}>
                              <Icon className="w-4 h-4" />
                              <span className="font-medium">{tempStyle.label}</span>
                            </div>
                          </div>
                        );
                    })()}
                    
                    {contact.date_cloture_prevue && (
                      <div>
                        <span className="text-sm text-slate-600">Clôture prévue:</span>
                        <p className="font-medium">
                          {format(new Date(contact.date_cloture_prevue), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Rappels */}
              <Card>
                <CardContent className="p-4">
                  <RappelSection contact={contact} />
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Sidebar */}
      {showChatSidebar && (
        <ChatSidebar
          contact={contact}
          onClose={() => setShowChatSidebar(false)}
          onInteractionAdded={loadInteractions}
        />
      )}
    </>
  );
}
