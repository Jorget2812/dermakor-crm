import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Prospect, PipelineStage, Canton, CompanyType, MaturityLevel, PotentialMonthly, LeadSource } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Performance from './components/Performance';
import Commissions from './components/Commissions';
import LeadCard from './components/LeadCard';
import LeadDetails from './components/LeadDetails';
import SwissMap from './components/SwissMap';
import Settings from './components/Settings';
import MessagingPanel from './components/MessagingPanel';
import PartnerApproval from './components/PartnerApproval';
import { useAuth } from './components/AuthProvider';
import { fetchLeads, createLead, updateLead, deleteLead, fetchCollaborators } from './utils/leads';
import { messagingService } from './services/messagingService';

const KanbanColumn: React.FC<{
  stage: PipelineStage;
  leads: Prospect[];
  collaborators: any[];
  onSelectLead: (lead: Prospect) => void;
}> = ({ stage, leads, collaborators, onSelectLead }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const columnLeads = leads.filter(l => l.pipelineStage === stage);

  return (
    <div key={stage} className="flex-shrink-0 w-[320px] flex flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#1C1F26] border border-[#2D323B] rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${stage === PipelineStage.FERME_GAGNE ? 'bg-[#10B981] shadow-[#10B981]/20' :
            stage === PipelineStage.FERME_PERDU ? 'bg-[#6B6B63]' :
              stage === PipelineStage.NEGOCIATION ? 'bg-[#F59E0B] shadow-[#F59E0B]/20' :
                'bg-[#D4AF37] shadow-[#D4AF37]/20'
            }`}></div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{stage.replace('_', ' ')}</h3>
        </div>
        <span className="text-[10px] font-black text-[#D4AF37] bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          {columnLeads.length}
        </span>
      </div>

      {/* Column Content */}
      <SortableContext
        id={stage}
        items={columnLeads.map(l => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar min-h-[500px] bg-white/[0.02] rounded-2xl p-2 border border-dashed transition-all ${isOver ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-[#2D323B]/50'
            }`}
        >
          {columnLeads.map((lead, index) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={onSelectLead}
              collaborators={collaborators}
            />
          ))}

          {columnLeads.length === 0 && (
            <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <span className="text-[9px] text-[#6B6B63] font-black uppercase tracking-[0.3em]">No Momentum</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const App: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [leads, setLeads] = useState<Prospect[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<Prospect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load leads and vendedores from Supabase on mount
  useEffect(() => {
    loadDataFromDatabase();
  }, []);

  // Messaging Effects
  useEffect(() => {
    if (!user) return;

    const loadUnread = async () => {
      const count = await messagingService.fetchUnreadCount();
      setUnreadCount(count);
    };

    loadUnread();

    const subscription = messagingService.subscribeToMessages((msg) => {
      if (msg.recipient_id === user.id) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadDataFromDatabase = async () => {
    try {
      setLoading(true);
      const [leadsData, collaboratorsData] = await Promise.all([
        fetchLeads(),
        fetchCollaborators()
      ]);
      setLeads(leadsData);
      setCollaborators(collaboratorsData);
      setError('');
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
      setLeads([]);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l =>
    (l.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.canton || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startNewLead = () => {
    const newLead: Prospect = {
      id: '', // Empty ID, Supabase will generate UUID
      companyName: '',
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
      canton: Canton.ZH,
      companyType: CompanyType.INSTITUT,
      potentialMonthly: PotentialMonthly.MOINS_5K,
      pipelineStage: PipelineStage.NOUVEAU,
      pipelineStageEnteredAt: new Date().toISOString(),
      probabilityClose: 0,
      isClosed: false,
      objections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadScore: 0,
      isPremiumCandidate: false,
      source: LeadSource.WEB
    };
    setSelectedLead(newLead);
  };

  const handleUpdateLead = async (updatedLead: Prospect) => {
    if (!user) return;

    try {
      const exists = leads.find(l => l.id === updatedLead.id);
      let savedLead: Prospect;

      if (exists && updatedLead.id) {
        // Update existing lead
        savedLead = await updateLead(updatedLead, user.id);
        // Instant state update for the board
        setLeads(prev => prev.map(l => l.id === savedLead.id ? savedLead : l));
      } else {
        // Create new lead
        const { id, ...newLeadData } = updatedLead;
        savedLead = await createLead(newLeadData as any, user.id);
        setLeads(prev => [savedLead, ...prev]);
      }

      setSelectedLead(null);
      setError('');
      return savedLead;
    } catch (err: any) {
      console.error('Error saving lead:', err);
      const errorMessage = err.message || "Erreur lors de l'enregistrement";
      setError(`Supabase Error: ${errorMessage}`);
      throw err;
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      setSelectedLead(null);
      setError('');
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      setError(`Supabase Error: ${err.message || "Erreur lors de la suppression"}`);
      throw err;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Check if we dropped on a column or a card
    let newStage: PipelineStage | null = null;

    // Column IDs are the stages themselves
    if (Object.values(PipelineStage).includes(overId as PipelineStage)) {
      newStage = overId as PipelineStage;
    } else {
      // If dropped on a card, find the card's stage
      const targetLead = leads.find(l => l.id === overId);
      if (targetLead) newStage = targetLead.pipelineStage;
    }

    if (!newStage) return;

    const leadToUpdate = leads.find(l => l.id === leadId);
    if (leadToUpdate && leadToUpdate.pipelineStage !== newStage) {
      const updatedLead = { ...leadToUpdate, pipelineStage: newStage };
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

      try {
        await handleUpdateLead(updatedLead);
      } catch (err) {
        // Rollback on error
        setLeads(prev => prev.map(l => l.id === leadId ? leadToUpdate : l));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-b-4 border-[#D4AF37] rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-[#D4AF37]/20"></div>
          <p className="text-[#D4AF37] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Executive Data...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard leads={leads} />;
      case 'pipeline':
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-220px)] custom-scrollbar">
              {Object.values(PipelineStage).map((stage) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  leads={filteredLeads}
                  collaborators={collaborators}
                  onSelectLead={setSelectedLead}
                />
              ))}
            </div>
          </DndContext>
        );
      case 'performance':
        return <Performance leads={leads} collaborators={collaborators} onNavigate={setActiveTab} />;
      case 'commissions':
        return <Commissions leads={leads} />;
      case 'academy':
        return (
          <div className="luxury-card p-10 h-[calc(100vh-220px)] overflow-y-auto shadow-2xl custom-scrollbar">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Ecosystème Partenaires Academy</h2>
                <p className="text-[#9E9E96] text-xs font-bold uppercase tracking-widest opacity-80">Suivi des certifications et montée en compétence de l'excellence suisse.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {leads.filter(l => l.interestAcademy).map(lead => (
                <div key={lead.id} onClick={() => setSelectedLead(lead)} className="flex items-center justify-between p-8 bg-[#1C1F26] rounded-2xl border border-[#2D323B] hover:border-[#D4AF37] hover:bg-white/5 transition-all cursor-pointer group shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/2 rounded-2xl flex items-center justify-center border border-white/5 text-[#D4AF37] shadow-xl group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <p className="font-black text-white text-xl group-hover:text-[#D4AF37] transition-colors tracking-tight">{lead.companyName || 'Lead Stratégique'}</p>
                      <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-[0.3em] mt-1">{lead.canton}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-16">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-3">Niveau de Certification</span>
                      <div className="w-80 h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full transition-all duration-1000 ${lead.pipelineStage === PipelineStage.FERME_GAGNE ? 'bg-[#10B981]' : 'bg-[#D4AF37]'}`} style={{ width: lead.pipelineStage === PipelineStage.FERME_GAGNE ? '100%' : '35%' }}></div>
                      </div>
                    </div>
                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black border tracking-widest ${lead.pipelineStage === PipelineStage.FERME_GAGNE ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' : 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]'}`}>
                      {lead.pipelineStage === PipelineStage.FERME_GAGNE ? 'CERTIFIÉ ELITE' : 'CURSUS EN COURS'}
                    </div>
                  </div>
                </div>
              ))}
              {leads.filter(l => l.interestAcademy).length === 0 && (
                <div className="text-center py-32 bg-white/2 rounded-3xl border-2 border-dashed border-white/5">
                  <GraduationCap size={56} className="mx-auto mb-6 text-white/5" />
                  <p className="text-[#6B6B63] font-black uppercase tracking-[0.3em]">Aucun Partenaire en Académie</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'map':
        return <SwissMap leads={leads} />;
      case 'approval':
        return <PartnerApproval />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white font-sans selection:bg-[#D4AF37]/20 selection:text-[#D4AF37]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="ml-[240px] px-12 py-10 min-h-screen">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewLead={startNewLead}
          error={error}
          isMessagingOpen={isMessagingOpen}
          setIsMessagingOpen={setIsMessagingOpen}
          unreadCount={unreadCount}
        />

        <div className="max-w-[1700px] mx-auto">
          {renderContent()}
        </div>

        <LeadDetails
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
        />

        <MessagingPanel
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      </main>

      {selectedLead && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[55] transition-all duration-500 animate-in fade-in"
          onClick={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default App;
