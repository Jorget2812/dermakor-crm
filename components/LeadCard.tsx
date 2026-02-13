import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ShieldAlert,
  Clock,
  MapPin,
  Building2,
  TrendingUp,
  MoreVertical
} from 'lucide-react';
import { Prospect, PipelineStage } from '../types';

interface LeadCardProps {
  lead: Prospect | any;
  onClick: (lead: Prospect) => void;
  index?: number;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, index = 0 }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.4 : 1,
  };
  
  // Fallbacks for transition period
  const companyName = lead.companyName || lead.name || 'Sans Nom';
  const score = lead.leadScore || 0;
  const isPremium = lead.isPremiumCandidate || false;
  const canton = lead.canton || '??';
  const urgent = lead.urgency === 'immediate' || lead.urgency === 'haute';

  const getPotentialLabel = () => {
    if (lead.estimatedDealValue) return `CHF ${lead.estimatedDealValue.toLocaleString()}`;
    const p = lead.potentialMonthly || lead.monthlyPotential;
    if (typeof p === 'number') return `CHF ${p.toLocaleString()}`;
    return p?.replace('_', ' ') || '0';
  };

  const calculateDays = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysSinceContact = calculateDays(lead.lastActivityAt || lead.lastContact);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      className={`group relative bg-[#1C1F26] border border-[#2D323B] rounded-xl lg:rounded-2xl p-3 lg:p-5 cursor-grab active:cursor-grabbing transition-all hover:border-[#D4AF37]/50 shadow-2xl ${
        isPremium ? 'ring-1 ring-[#D4AF37]/30 bg-gradient-to-br from-[#1C1F26] to-[#D4AF37]/5' : ''
      } ${isDragging ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]' : ''}`}
    >
      {/* Top Badges */}
      <div className="flex justify-between items-start mb-2 lg:mb-3">
        <div className="flex flex-wrap gap-1 lg:gap-1.5">
          {isPremium && (
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] lg:text-[9px] font-black px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-lg flex items-center gap-1 lg:gap-1.5 border border-[#D4AF37]/20">
              <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]"></span>
              PREMIUM
            </span>
          )}
          {urgent && (
            <span className="bg-status-error/10 text-status-error text-[8px] lg:text-[9px] font-bold px-1.5 lg:px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert size={9} className="lg:w-[10px] lg:h-[10px]" />
              URGENT
            </span>
          )}
        </div>
        <button className="text-[#6B6B63] hover:text-[#D4AF37] transition-colors">
          <MoreVertical size={12} className="lg:w-[14px] lg:h-[14px]" />
        </button>
      </div>

      {/* Main Info */}
      <h3 className="font-black text-white text-xs lg:text-sm mb-1 line-clamp-1 group-hover:text-[#D4AF37] transition-colors tracking-tight">
        {companyName}
      </h3>

      <div className="flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] text-[#9E9E96] mb-3 lg:mb-5 font-black uppercase tracking-[0.15em]">
        <div className="flex items-center gap-1 lg:gap-1.5">
          <MapPin size={9} className="text-[#D4AF37] lg:w-[10px] lg:h-[10px]" strokeWidth={3} />
          {canton}
        </div>
        <div className="flex items-center gap-1 lg:gap-1.5 text-[#6B6B63]">
          <Building2 size={9} className="lg:w-[10px] lg:h-[10px]" />
          {lead.companyType || lead.structure || 'Institut'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-5">
        <div className="bg-white/2 p-2 lg:p-2.5 rounded-lg lg:rounded-xl border border-white/5 group-hover:bg-white/5 transition-all">
          <p className="text-[8px] lg:text-[9px] text-[#6B6B63] font-black uppercase tracking-widest mb-0.5 lg:mb-1">Potentiel</p>
          <p className="text-[10px] lg:text-xs font-black text-white tracking-tighter">{getPotentialLabel()}</p>
        </div>
        <div className="bg-white/2 p-2 lg:p-2.5 rounded-lg lg:rounded-xl border border-white/5 group-hover:bg-white/5 transition-all">
          <div className="flex justify-between items-center mb-1 lg:mb-1.5">
            <p className="text-[8px] lg:text-[9px] text-[#6B6B63] font-black uppercase tracking-widest">Score</p>
            <span className="text-[9px] lg:text-[10px] font-black text-[#D4AF37]">{score}</span>
          </div>
          <div className="h-0.5 lg:h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${score >= 60 ? 'bg-[#D4AF37]' : 'bg-[#6B6B63]'}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 lg:pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 lg:gap-3 text-[8px] lg:text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1 lg:gap-1.5 text-[#6B6B63]">
            <Clock size={9} className="lg:w-[10px] lg:h-[10px]" />
            <span>{daysSinceContact === null ? 'INIT' : `${daysSinceContact}J`}</span>
          </div>
          {daysSinceContact !== null && daysSinceContact > 2 && isPremium && (
            <span className="text-[#EF4444] animate-pulse hidden lg:inline">CRITIQUE !</span>
          )}
        </div>

        <div className="flex -space-x-1.5 focus-within:z-10">
          <img
            src={`https://ui-avatars.com/api/?name=${lead.assignedTo || lead.owner}&background=C0A76A&color=fff`}
            className="w-4 h-4 lg:w-5 lg:h-5 rounded-full border border-white shadow-sm hover:scale-110 transition-transform cursor-help"
            title={lead.assignedTo || lead.owner}
            alt="Assigné"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LeadCard;