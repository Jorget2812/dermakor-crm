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
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
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
import { storageService, ProspectDocument } from '../services/storageService';
import { activityService, Activity } from '../services/activityService';
import { saleService, Sale } from '../services/saleService';
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
  onDelete?: (id: string) => void;
}

const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'pipeline' | 'activities' | 'documents'>('profil');
  const [editedLead, setEditedLead] = useState<Prospect | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [newObjection, setNewObjection] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [documents, setDocuments] = useState<ProspectDocument[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fetchingDocs, setFetchingDocs] = useState(false);
  const [fetchingActivities, setFetchingActivities] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isLoggingActivity, setIsLoggingActivity] = useState<'call' | 'email' | 'demo' | null>(null);
  const [isLoggingSale, setIsLoggingSale] = useState(false);
  const [saleData, setSaleData] = useState({ amount: 0, productName: '', notes: '' });
  const [activityNote, setActivityNote] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { role } = useAuth();

  const isDirector = role === 'director' || role === 'directeur'; // Affiché comme 'Responsable' dans l'UI

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

  useEffect(() => {
    if (activeTab === 'documents' && lead?.id) {
      loadDocuments();
    }
    if (activeTab === 'activities' && lead?.id) {
      loadActivities();
    }
  }, [activeTab, lead?.id]);

  const loadActivities = async () => {
    if (!lead?.id) return;
    setFetchingActivities(true);
    try {
      const data = await activityService.getActivities(lead.id);
      setActivities(data);
    } catch (err: any) {
      console.error('Error loading activities:', err);
    } finally {
      setFetchingActivities(false);
    }
  };

  const handleLogActivity = async () => {
    if (!lead?.id || !isLoggingActivity || !activityNote.trim()) return;

    setSaving(true);
    try {
      const titles = {
        call: 'Llamada comercial',
        email: 'Seguimiento por Email',
        demo: 'Presentación / Demo'
      };

      await activityService.createActivity({
        prospect_id: lead.id,
        activity_type: isLoggingActivity,
        title: titles[isLoggingActivity],
        description: activityNote,
        scheduled_date: new Date().toISOString(),
        completed: true,
        completed_at: new Date().toISOString(),
        priority: 'normal'
      });

      setActivityNote('');
      setIsLoggingActivity(null);
      await loadActivities();
    } catch (err: any) {
      setError(`Error logging activity: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogSale = async () => {
    if (!lead?.id || !saleData.amount) return;

    setSaving(true);
    try {
      await saleService.createSale({
        prospect_id: lead.id,
        seller_id: lead.assigned_to,
        sale_amount: saleData.amount,
        product_name: saleData.productName,
        notes: saleData.notes,
        tracking_method: 'manual',
        status: 'pending',
        sale_date: new Date().toISOString().split('T')[0]
      });

      if (editedLead.pipelineStage !== PipelineStage.FERME_GAGNE) {
        handleChange('pipelineStage', PipelineStage.FERME_GAGNE);
      }

      setIsLoggingSale(false);
      setSaleData({ amount: 0, productName: '', notes: '' });
      alert('Vente enregistrée avec succès !');
    } catch (err: any) {
      setError(`Error logging sale: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const loadDocuments = async () => {
    if (!lead?.id) return;
    setFetchingDocs(true);
    try {
      const docs = await storageService.listDocuments(lead.id);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error loading documents:', err);
    } finally {
      setFetchingDocs(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !lead?.id) return;

    setUploading(true);
    setError('');
    try {
      const newDoc = await storageService.uploadDocument(lead.id, file);
      setDocuments(prev => [newDoc, ...prev]);
    } catch (err: any) {
      setError(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc: ProspectDocument) => {
    try {
      const url = await storageService.getDownloadUrl(doc.file_path);
      window.open(url, '_blank');
    } catch (err: any) {
      setError(`Download Error: ${err.message}`);
    }
  };

  const handleDeleteDoc = async (doc: ProspectDocument) => {
    if (!window.confirm(`Supprimer ${doc.name} ?`)) return;
    try {
      await storageService.deleteDocument(doc.id, doc.file_path);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (err: any) {
      setError(`Delete Error: ${err.message}`);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={20} />;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return <FileSpreadsheet size={20} />;
    return <FileText size={20} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const handleDelete = async () => {
    if (!lead || !onDelete || !window.confirm("Êtes-vous sûr de vouloir supprimer ce prospect ? Cette action est irréversible.")) return;

    setDeleting(true);
    setError('');
    try {
      await onDelete(lead.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
      setDeleting(false);
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
          className="relative w-[850px] bg-[#1C1F26] h-screen shadow-2xl flex flex-col pointer-events-auto border-l border-[#D4AF37]/20"
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
          <div className="flex border-b border-[#2D323B] bg-[#1C1F26] px-10 sticky top-0 z-20">
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
              <div className="mx-10 mt-6 bg-[#EF4444]/10 border border-[#EF4444]/20 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <AlertCircle className="text-[#EF4444]" size={20} />
                <p className="text-[#EF4444] text-xs font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="p-10 space-y-12">
              {/* TAB: PROFIL */}
              {activeTab === 'profil' && (
                <div className="space-y-12">
                  {/* Section: Entreprise */}
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
                      <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Identité Corporate Elite</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
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
                        <div className="col-span-6 pt-6 border-t border-white/5">
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
                  <div className="grid grid-cols-2 gap-8 bg-[#0F1115] p-10 rounded-[32px] text-white border border-[#D4AF37]/20 shadow-2xl">
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
                        className="flex-1 px-5 py-3 bg-[#1C1F26] border border-[#2D323B] rounded-xl text-sm font-medium text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20 placeholder:text-[#6B6B63]"
                        onKeyPress={(e) => e.key === 'Enter' && addObjection()}
                      />
                      <button
                        onClick={addObjection}
                        className="bg-[#D4AF37] text-black px-5 py-3 rounded-xl hover:bg-[#A68F54] transition-colors active:scale-95"
                      >
                        <Tag size={18} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {editedLead.objections?.map((obj, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1.5 rounded-full text-xs font-bold border border-[#D4AF37]/20">
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
                      className="w-full px-6 py-5 bg-[#1C1F26] border border-[#2D323B] rounded-[32px] text-sm font-medium text-white outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all placeholder:text-[#6B6B63] placeholder:italic"
                      placeholder="Décrivez l'approche commerciale, les besoins spécifiques..."
                    />
                  </section>

                  {/* DIRECTOR SALE LOGGING */}
                  {isDirector && (
                    <section className="bg-[#D4AF37]/5 border-2 border-dashed border-[#D4AF37]/30 rounded-[32px] p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-black shadow-lg">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Enregistrement de la Vente</h3>
                            <p className="text-[9px] text-[#D4AF37] font-black uppercase">Réservé à la direction</p>
                          </div>
                        </div>
                        {!isLoggingSale && (
                          <button
                            onClick={() => setIsLoggingSale(true)}
                            className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                          >
                            Démarrer Signature
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isLoggingSale && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 pt-2"
                          >
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Montant de la Vente (CHF)</label>
                                <input
                                  type="number"
                                  value={saleData.amount}
                                  onChange={e => setSaleData({ ...saleData, amount: Number(e.target.value) })}
                                  className="w-full bg-[#0F1115] border border-[#2D323B] rounded-xl px-5 py-3 text-white font-black"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Produit principal</label>
                                <input
                                  type="text"
                                  value={saleData.productName}
                                  onChange={e => setSaleData({ ...saleData, productName: e.target.value })}
                                  className="w-full bg-[#0F1115] border border-[#2D323B] rounded-xl px-5 py-3 text-white font-black"
                                  placeholder="KRX Ligne, etc."
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Notes de Facturation / Comms</label>
                              <textarea
                                value={saleData.notes}
                                onChange={e => setSaleData({ ...saleData, notes: e.target.value })}
                                className="w-full bg-[#0F1115] border border-[#2D323B] rounded-xl px-5 py-3 text-white text-sm"
                                placeholder="..."
                              />
                            </div>
                            <div className="flex justify-end gap-4 pt-2">
                              <button
                                onClick={() => setIsLoggingSale(false)}
                                className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.2em] hover:text-white"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={handleLogSale}
                                disabled={saving || !saleData.amount}
                                className="bg-[#D4AF37] text-black px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
                              >
                                {saving ? 'Traitement...' : 'Confirmer la Vente & Commission'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </section>
                  )}
                </div>
              )}

              {/* TAB: ACTIVITIES (TIMELINE) */}
              {activeTab === 'activities' && (
                <div className="space-y-8">
                  {/* Quick Activity Button */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsLoggingActivity('call')}
                      className={`flex-1 py-4 bg-[#1C1F26] border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group ${isLoggingActivity === 'call' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#2D323B] hover:border-[#D4AF37]'}`}
                    >
                      <Phone size={20} className={isLoggingActivity === 'call' ? 'text-[#D4AF37]' : 'text-[#6B6B63] group-hover:text-[#D4AF37]'} />
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isLoggingActivity === 'call' ? 'text-[#D4AF37]' : 'text-[#6B6B63] group-hover:text-[#D4AF37]'}`}>Log Appel</span>
                    </button>
                    <button
                      onClick={() => setIsLoggingActivity('email')}
                      className={`flex-1 py-4 bg-[#1C1F26] border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group ${isLoggingActivity === 'email' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#2D323B] hover:border-[#D4AF37]'}`}
                    >
                      <Mail size={20} className={isLoggingActivity === 'email' ? 'text-[#D4AF37]' : 'text-[#6B6B63] group-hover:text-[#D4AF37]'} />
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isLoggingActivity === 'email' ? 'text-[#D4AF37]' : 'text-[#6B6B63] group-hover:text-[#D4AF37]'}`}>Send Email</span>
                    </button>
                    <button
                      onClick={() => setIsLoggingActivity('demo')}
                      className={`flex-1 py-4 bg-[#1C1F26] border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group ${isLoggingActivity === 'demo' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#2D323B] hover:border-[#D4AF37]'}`}
                    >
                      <Zap size={20} className={isLoggingActivity === 'demo' ? 'text-[#D4AF37]' : 'text-[#6B6B63] group-hover:text-[#D4AF37]'} />
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isLoggingActivity === 'demo' ? 'text-[#D4AF37]' : 'text-[#6B6B63] group-hover:text-[#D4AF37]'}`}>Quick Demo</span>
                    </button>
                  </div>

                  {/* Logging Form Inline */}
                  <AnimatePresence>
                    {isLoggingActivity && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-3xl p-6 mb-10 space-y-4">
                          <h4 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-2">
                            {isLoggingActivity === 'call' ? '☎️ Rapport d\'appel' : isLoggingActivity === 'email' ? '📧 Programmation Email' : '🤝 Agenda Demo'}
                          </h4>
                          <textarea
                            value={activityNote}
                            onChange={(e) => setActivityNote(e.target.value)}
                            className="w-full bg-[#0F1115] border border-[#2D323B] rounded-2xl p-4 text-white text-sm outline-none focus:border-[#D4AF37]/50 transition-all min-h-[100px]"
                            placeholder={isLoggingActivity === 'call' ? "Notes de l'appel..." : "Contenu ou objet..."}
                          />
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setIsLoggingActivity(null)}
                              className="px-6 py-2 text-[9px] font-black text-[#6B6B63] uppercase tracking-widest hover:text-white"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleLogActivity}
                              className="px-6 py-2 bg-[#D4AF37] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#A68F54] transition-all"
                            >
                              Valider
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Timeline */}
                  <div className="relative pl-10 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#D4AF37]/40 before:to-transparent">
                    {fetchingActivities ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                      </div>
                    ) : (
                      activities.map((act) => (
                        <div key={act.id} className="relative group">
                          <div className={`absolute -left-[35px] w-8 h-8 rounded-full border-4 border-[#0F1115] flex items-center justify-center z-10 shadow-xl transition-all ${act.completed ? 'bg-[#D4AF37] text-black' : 'bg-[#1C1F26] text-[#D4AF37]'}`}>
                            {act.activity_type === 'call' ? <Phone size={14} /> : act.activity_type === 'email' ? <Mail size={14} /> : <Zap size={14} />}
                          </div>
                          <div className="bg-[#1C1F26] p-8 rounded-[32px] border border-[#2D323B] hover:border-[#D4AF37]/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className="font-black text-white text-sm uppercase tracking-tight">{act.title}</h5>
                                <p className="text-[9px] text-[#6B6B63] font-black uppercase tracking-[0.2em] mt-1">
                                  {new Date(act.scheduled_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {isDirector && (
                                <button
                                  onClick={() => activityService.deleteActivity(act.id).then(() => loadActivities())}
                                  className="text-[#6B6B63] hover:text-[#EF4444] p-2 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-[#9E9E96] leading-relaxed font-medium italic opacity-80">
                              "{act.description || 'Pas de description.'}"
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                    {activities.length === 0 && !fetchingActivities && (
                      <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                        <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-[0.3em]">Aucune activité enregistrée stratégiquement</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-[#2D323B] rounded-[32px] p-12 text-center bg-[#1C1F26]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4AF37] shadow-xl">
                      {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <h4 className="text-sm font-black text-white mb-2 uppercase tracking-widest">Coffre-fort Digital Partenaire</h4>
                    <p className="text-[10px] text-[#6B6B63] mb-6 max-w-xs mx-auto font-black uppercase tracking-widest">Stockez ici les contrats signés, fiches techniques et factures.</p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-[#D4AF37] text-black px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#E5C158] transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                      {uploading ? 'Transfert en cours...' : 'Déposer Documents'}
                    </button>
                  </div>

                  {fetchingDocs ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-5 bg-[#1C1F26] border border-[#2D323B] rounded-2xl hover:border-[#D4AF37]/50 transition-all group shadow-xl"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => handleDownload(doc)}>
                            <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#D4AF37]/10 ${doc.file_type.includes('pdf') ? 'text-red-400' :
                              doc.file_type.includes('image') ? 'text-blue-400' : 'text-[#D4AF37]'
                              }`}>
                              {getFileIcon(doc.file_type)}
                            </div>
                            <div className="flex-1 min-w-0 cursor-pointer">
                              <p className="text-[11px] font-black text-white truncate uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{doc.name}</p>
                              <p className="text-[9px] text-[#6B6B63] font-black uppercase mt-0.5 tracking-widest">{formatSize(doc.file_size)} • {doc.file_type.split('/').pop()?.toUpperCase()}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-2 text-[#6B6B63] hover:text-[#D4AF37] transition-colors"
                              title="Télécharger"
                            >
                              <Download size={16} />
                            </button>
                            {isDirector && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc); }}
                                className="p-2 text-[#6B6B63] hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {documents.length === 0 && !fetchingDocs && (
                        <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] bg-white/[0.02]">
                          <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-[0.3em]">Aucun document stratégique déposé</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="bg-[#0F1115] border-t border-[#2D323B] px-10 py-8 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-[#6B6B63] hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all"
            >
              Annuler les modifications
            </button>

            <div className="flex items-center gap-6">
              {isDirector && (
                <button
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="p-4 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-2xl transition-all border border-[#EF4444]/20 flex items-center gap-2 group disabled:opacity-50"
                  title="Supprimer définitivement"
                >
                  <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Supprimer</span>
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving || deleting}
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
