import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User as UserIcon,
  MapPin,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Target,
  History,
  FileText,
  Zap,
  Save,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Tag,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { fetchCollaborators } from '../utils/leads';
import {
  Prospect,
  PipelineStage,
  Canton,
  CompanyType,
  LeadSource,
  PotentialMonthly,
  UrgencyLevel,
  InvestmentCapacity,
  PriceSensitivity
} from '../types';

interface LeadDetailsProps {
  lead: Prospect | null;
  onClose: () => void;
  onUpdate: (lead: Prospect) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'pipeline' | 'activities' | 'documents'>('profil');
  const [editedLead, setEditedLead] = useState<Prospect | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newObjection, setNewObjection] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const { role } = useAuth();

  const isDirector = role === 'director' || role === 'directeur';

  useEffect(() => {
    if (isDirector) {
      fetchCollaborators()
        .then(setCollaborators)
        .catch(console.error);
    }
  }, [isDirector]);

  useEffect(() => {
    if (lead) {
      setEditedLead({ ...lead });
      setActiveTab('profil');
      setError('');
    }
  }, [lead]);

  if (!lead || !editedLead) return null;

  const handleChange = (field: keyof Prospect, value: any) => {
    setEditedLead(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!editedLead) return;
    if (!editedLead.companyName.trim()) {
      setError("Le nom de l'entreprise est obligatoire.");
      setActiveTab('profil');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onUpdate(editedLead);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const addObjection = () => {
    if (!newObjection.trim()) return;
    const currentObjections = editedLead.objections || [];
    handleChange('objections', [...currentObjections, newObjection.trim()]);
    setNewObjection('');
  };

  const removeObjection = (index: number) => {
    const currentObjections = editedLead.objections || [];
    handleChange('objections', currentObjections.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
        {/* Backdrop for mobile or smaller screens if needed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-executive-neutral-900/40 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 35, stiffness: 200 }}
          className="relative w-full md:w-[850px] bg-[#1C1F26] h-screen shadow-2xl flex flex-col pointer-events-auto border-l border-[#D4AF37]/20"
        >
          {/* Executive Header */}
          <div className="bg-[#0F1115] px-10 py-10 text-white relative flex justify-between items-start overflow-hidden border-b border-[#2D323B]">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full -translate-y-40 translate-x-40 blur-[100px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${editedLead.isPremiumCandidate ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 border-white/5 text-[#6B6B63]'
                  }`}>
                  {editedLead.isPremiumCandidate ? 'V-ELITE CANDIDATE' : 'STANDARD PROSPECT'}
                </span>
                <span className="text-executive-neutral-400 text-xs font-bold uppercase tracking-widest">ID: {editedLead.id.slice(0, 8)}</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-2 text-white">{editedLead.companyName || 'Nouveau Prospect'}</h2>
              <div className="flex items-center gap-6 text-[#9E9E96] text-xs font-black uppercase tracking-widest opacity-80">
                <span className="flex items-center gap-2"><MapPin size={14} className="text-[#D4AF37]" /> {editedLead.canton}</span>
                <span className="flex items-center gap-2"><Building2 size={14} className="text-[#D4AF37]" strokeWidth={2.5} /> {editedLead.companyType}</span>
                <span className="flex items-center gap-2 border border-white/10 px-2 py-0.5 rounded-md"><TrendingUp size={14} className="text-[#D4AF37]" /> SCORE: {editedLead.leadScore || 0}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="relative z-10 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:rotate-90"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#2D323B] bg-[#1C1F26] px-4 md:px-10 sticky top-0 z-20 overflow-x-auto no-scrollbar">
            {[
              { id: 'profil', label: 'Profil Partner', icon: Building2 },
              { id: 'pipeline', label: 'Stratégie SQL', icon: Target },
              { id: 'activities', label: 'Management', icon: History },
              { id: 'documents', label: 'Ressources', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id
                  ? 'text-[#D4AF37]'
                  : 'text-[#6B6B63] hover:text-white'
                  }`}
              >
                <tab.icon size={14} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" />
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0F1115]/30">
            {error && (
              <div className="mx-4 md:mx-10 mt-6 bg-[#EF4444]/10 border border-[#EF4444]/20 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <AlertCircle className="text-[#EF4444]" size={20} />
                <p className="text-[#EF4444] text-xs font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="p-4 md:p-10 space-y-12">
              {/* TAB: PROFIL */}
              {activeTab === 'profil' && (
                <div className="space-y-12">
                  {/* Section: Entreprise */}
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Identité Corporate Elite</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Raison Sociale</label>
                        <input
                          type="text"
                          value={editedLead.companyName}
                          onChange={(e) => handleChange('companyName', e.target.value)}
                          className="w-full px-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Site Web Public</label>
                        <div className="relative">
                          <Globe size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                          <input
                            type="text"
                            value={editedLead.companyWebsite || ''}
                            onChange={(e) => handleChange('companyWebsite', e.target.value)}
                            placeholder="www.excellence-suisse.ch"
                            className="w-full pl-12 pr-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Numéro IDE Registre</label>
                        <input
                          type="text"
                          value={editedLead.ideNumber || ''}
                          onChange={(e) => handleChange('ideNumber', e.target.value)}
                          placeholder="CHE-XXX.XXX.XXX"
                          className="w-full px-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Secteur Activité</label>
                        <select
                          value={editedLead.companyType}
                          onChange={(e) => handleChange('companyType', e.target.value as CompanyType)}
                          className="w-full px-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none appearance-none"
                        >
                          {Object.values(CompanyType).map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Canton Stratégique</label>
                        <select
                          value={editedLead.canton}
                          onChange={(e) => handleChange('canton', e.target.value as Canton)}
                          className="w-full px-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none"
                        >
                          {Object.values(Canton).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Section: Contact */}
                  <section>
                    <div className="flex items-center gap-3 mb-8 pt-6 border-t border-white/5">
                      <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Décideur Exécutif</h3>
                    </div>
                    <div className="grid grid-cols-6 gap-8">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Titre</label>
                        <select
                          value={editedLead.contactCivility || ''}
                          onChange={(e) => handleChange('contactCivility', e.target.value)}
                          className="w-full px-4 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none"
                        >
                          <option value="M.">M.</option>
                          <option value="Mme">MME</option>
                          <option value="Dr">DR</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Prénom</label>
                        <input
                          type="text"
                          value={editedLead.contactFirstName}
                          onChange={(e) => handleChange('contactFirstName', e.target.value)}
                          className="w-full px-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Nom de Famille</label>
                        <input
                          type="text"
                          value={editedLead.contactLastName}
                          onChange={(e) => handleChange('contactLastName', e.target.value)}
                          className="w-full px-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Email Direct</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                          <input
                            type="email"
                            value={editedLead.contactEmail}
                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Ligne Privée / WA</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                          <input
                            type="tel"
                            value={editedLead.contactPhone}
                            onChange={(e) => handleChange('contactPhone', e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-black text-white outline-none"
                          />
                        </div>
                      </div>

                      {isDirector && (
                        <div className="col-span-1 md:col-span-6 pt-6 border-t border-white/5">
                          <label className="block text-[10px] font-black text-[#D4AF37] uppercase tracking-[.3em] mb-4 flex items-center gap-2">
                            <UserPlus size={14} />
                            Collaborateur Assigné
                          </label>
                          <div className="relative">
                            <UserIcon size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                            <select
                              value={editedLead.assignedTo || ''}
                              onChange={(e) => handleChange('assignedTo', e.target.value)}
                              className="w-full pl-12 pr-6 py-4 bg-[#0F1115] border border-[#D4AF37]/30 rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all appearance-none"
                            >
                              <option value="">NON ASSIGNÉ</option>
                              {collaborators.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.full_name?.toUpperCase() || 'COLLABORATEUR SANS NOM'} ({c.role?.toUpperCase()})
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                              <TrendingUp className="text-[#D4AF37] opacity-50 rotate-90" size={14} />
                            </div>
                          </div>
                          <p className="mt-3 text-[9px] text-[#6B6B63] font-black uppercase tracking-widest italic">
                            Seuls les Directeurs peuvent réassigner les opportunités stratégiques.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: PIPELINE */}
              {activeTab === 'pipeline' && (
                <div className="space-y-10">
                  {/* Status & Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0F1115] p-6 md:p-10 rounded-[32px] text-white border border-[#D4AF37]/20 shadow-2xl">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.3em]">Étape du Cycle SQL</label>
                      <select
                        value={editedLead.pipelineStage}
                        onChange={(e) => handleChange('pipelineStage', e.target.value as PipelineStage)}
                        className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                      >
                        {Object.values(PipelineStage).map(v => <option key={v} value={v}>{v.toUpperCase().replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.3em]">Potentiel Économique</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#D4AF37]">CHF</span>
                        <input
                          type="number"
                          value={editedLead.estimatedDealValue || 0}
                          onChange={(e) => handleChange('estimatedDealValue', Number(e.target.value))}
                          className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl pl-16 pr-6 py-4 text-2xl font-black text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Objections & Objections Manager */}
                  <section>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-executive-gold-500" />
                        <h3 className="text-sm font-bold text-executive-neutral-800 uppercase tracking-wider">Gestion des Objections</h3>
                      </div>
                      <span className="text-[10px] font-bold text-executive-neutral-400 uppercase">{editedLead.objections?.length || 0} Identification(s)</span>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newObjection}
                        onChange={(e) => setNewObjection(e.target.value)}
                        placeholder="Ex: Prix trop élevé, Déjà équipé..."
                        className="flex-1 px-5 py-3 bg-white border border-executive-neutral-200 rounded-xl text-sm font-medium outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && addObjection()}
                      />
                      <button
                        onClick={addObjection}
                        className="bg-executive-neutral-800 text-white px-5 py-3 rounded-xl hover:bg-executive-neutral-700 transition-colors"
                      >
                        <Tag size={18} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {editedLead.objections?.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2 bg-executive-neutral-100 text-executive-neutral-700 px-3 py-1.5 rounded-full text-xs font-bold border border-executive-neutral-200">
                          {obj}
                          <button onClick={() => removeObjection(i)} className="text-executive-neutral-400 hover:text-status-error"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Strategic Notes */}
                  <section>
                    <label className="block text-[10px] font-bold text-executive-neutral-400 uppercase tracking-widest mb-4">Notes Stratégiques & Argumentaire</label>
                    <textarea
                      value={editedLead.strategicNotes || ''}
                      onChange={(e) => handleChange('strategicNotes', e.target.value)}
                      rows={8}
                      className="w-full px-6 py-5 bg-white border border-executive-neutral-200 rounded-[32px] text-sm font-medium outline-none focus:ring-2 focus:ring-executive-gold-500/20 italic text-executive-neutral-700"
                      placeholder="Décrivez l'approche commerciale, les besoins spécifiques..."
                    />
                  </section>
                </div>
              )}

              {/* TAB: ACTIVITIES (TIMELINE) */}
              {activeTab === 'activities' && (
                <div className="space-y-8">
                  {/* Quick Activity Button */}
                  <div className="flex gap-4 mb-4">
                    <button className="flex-1 py-4 bg-white border border-executive-neutral-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-executive-gold-500 transition-all group">
                      <Phone size={20} className="text-executive-neutral-400 group-hover:text-executive-gold-500" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-executive-neutral-500">Log Appel</span>
                    </button>
                    <button className="flex-1 py-4 bg-white border border-executive-neutral-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-executive-gold-500 transition-all group">
                      <Mail size={20} className="text-executive-neutral-400 group-hover:text-executive-gold-500" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-executive-neutral-500">Send Email</span>
                    </button>
                    <button className="flex-1 py-4 bg-white border border-executive-neutral-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-executive-gold-500 transition-all group">
                      <Zap size={20} className="text-executive-neutral-400 group-hover:text-executive-gold-500" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-executive-neutral-500">Quick Demo</span>
                    </button>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-executive-neutral-100">
                    <div className="relative">
                      <div className="absolute -left-8 w-6 h-6 bg-executive-gold-500 rounded-full border-4 border-executive-neutral-50 flex items-center justify-center z-10 shadow-lg"></div>
                      <div className="bg-white p-6 rounded-3xl border border-executive-neutral-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-executive-neutral-800 text-sm">Appel de qualification effectué</p>
                          <span className="text-[10px] text-executive-neutral-400 font-bold">AUJOURD'HUI</span>
                        </div>
                        <p className="text-xs text-executive-neutral-500 leading-relaxed italic">"Le client semble très intéressé par la ligne KRX. Besoin urgent d'une démonstration sur site. Possède déjà une équipe de 4 esthéticiennes."</p>
                      </div>
                    </div>

                    <div className="relative opacity-60">
                      <div className="absolute -left-8 w-6 h-6 bg-executive-neutral-300 rounded-full border-4 border-executive-neutral-50 flex items-center justify-center z-10"></div>
                      <div className="p-4 rounded-2xl border border-dashed border-executive-neutral-200">
                        <p className="text-xs font-bold text-executive-neutral-400">Email Marketing Envoyé - Template: Brochure 2026</p>
                        <p className="text-[9px] text-executive-neutral-400 font-medium">12 Février @ 14:30</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-executive-neutral-200 rounded-[32px] p-12 text-center bg-white">
                    <div className="w-16 h-16 bg-executive-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 text-executive-neutral-300">
                      <FileText size={32} />
                    </div>
                    <h4 className="text-sm font-bold text-executive-neutral-800 mb-2">Coffre-fort Digital Partenaire</h4>
                    <p className="text-xs text-executive-neutral-400 mb-6 max-w-xs mx-auto">Stockez ici les contrats signés, fiches techniques et factures.</p>
                    <button className="bg-executive-neutral-100 text-executive-neutral-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-executive-gold-500 hover:text-white transition-all shadow-inner">
                      Déposer Documents
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-white border border-executive-neutral-100 rounded-2xl hover:border-executive-gold-500 transition-all cursor-pointer group shadow-sm">
                      <div className="w-10 h-10 bg-executive-neutral-50 rounded-lg flex items-center justify-center text-status-info"><FileText size={20} /></div>
                      <div>
                        <p className="text-xs font-bold text-executive-neutral-800">Contrat_Cadre_V1.pdf</p>
                        <p className="text-[9px] text-executive-neutral-400 font-bold uppercase">1.2 MB • PDF</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white border border-executive-neutral-100 rounded-2xl hover:border-executive-gold-500 transition-all cursor-pointer group shadow-sm">
                      <div className="w-10 h-10 bg-executive-neutral-50 rounded-lg flex items-center justify-center text-status-success"><FileText size={20} /></div>
                      <div>
                        <p className="text-xs font-bold text-executive-neutral-800">Photos_Cabinet_ZH.zip</p>
                        <p className="text-[9px] text-executive-neutral-400 font-bold uppercase">45 MB • ZIP</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="bg-[#0F1115] border-t border-[#2D323B] px-4 md:px-10 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="text-[#6B6B63] hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all"
            >
              Annuler les modifications
            </button>

            <div className="flex items-center gap-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-gold flex items-center gap-3 px-10 py-4 shadow-2xl shadow-black/50 active:scale-95 disabled:opacity-50 group"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <Save size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                )}
                <span className="text-sm font-black tracking-widest uppercase">
                  {saving ? 'Synchronisation...' : 'Valider & Enregistrer'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadDetails;
