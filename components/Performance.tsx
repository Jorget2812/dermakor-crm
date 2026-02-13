import React, { useMemo } from 'react';
import { Prospect, PipelineStage } from '../types';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Target,
    Award,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface PerformanceProps {
    leads: Prospect[];
    collaborators: any[];
    onNavigate: (tab: string) => void;
}

const Performance: React.FC<PerformanceProps> = ({ leads, collaborators, onNavigate }) => {
    // 1. Pipeline Health Stats
    const stats = useMemo(() => {
        const total = leads.length;
        const won = leads.filter(l => l.pipelineStage === PipelineStage.FERME_GAGNE).length;
        const lost = leads.filter(l => l.pipelineStage === PipelineStage.FERME_PERDU).length;
        const active = total - won - lost;

        const conversionRate = (won + lost) > 0 ? (won / (won + lost)) * 100 : 0;

        return { total, won, lost, active, conversionRate };
    }, [leads]);

    // 2. Data for Conversion Funnel
    const funnelData = useMemo(() => {
        return Object.values(PipelineStage).map(stage => ({
            name: stage.replace('_', ' ').toUpperCase(),
            value: leads.filter(l => l.pipelineStage === stage).length
        }));
    }, [leads]);

    // 3. Dynamic Rankings
    const rankings = useMemo(() => {
        if (!collaborators || collaborators.length === 0) return [];

        const targetDefault = 250000; // Target de base par défaut

        return collaborators.map(v => {
            const myLeads = leads.filter(l => l.assignedTo === v.id);
            const sales = myLeads
                .filter(l => l.pipelineStage === PipelineStage.FERME_GAGNE)
                .reduce((sum, l) => sum + (l.finalDealValue || l.estimatedDealValue || 0), 0);

            // Get initials for avatar
            const initials = v.full_name
                ? v.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
                : '??';

            return {
                name: v.full_name || 'Utilisateur',
                sales: sales,
                target: targetDefault,
                avatar: initials
            };
        }).sort((a, b) => b.sales - a.sales);
    }, [leads, collaborators]);

    const COLORS = ['#D4AF37', '#E5C158', '#CBB26A', '#A18B4A', '#897A42', '#6B6036', '#4D452B'];

    return (
        <div className="space-y-8 pb-10">
            {/* KPI Executive Header */}
            <div className="grid grid-cols-4 gap-6">
                <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            <Target size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-[#10B981] text-[10px] font-black uppercase tracking-widest bg-[#10B981]/10 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} /> +12%
                        </span>
                    </div>
                    <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Lead Conversion</p>
                    <p className="text-3xl font-black text-white">{stats.conversionRate.toFixed(1)}%</p>
                </div>

                <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            <Briefcase size={20} />
                        </div>
                        <span className="text-[#6B6B63] text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                            STABLE
                        </span>
                    </div>
                    <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Ecosystem Active</p>
                    <p className="text-3xl font-black text-white">{stats.active}</p>
                </div>

                <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            <Award size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-[#10B981] text-[10px] font-black uppercase tracking-widest bg-[#10B981]/10 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} /> +2
                        </span>
                    </div>
                    <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Closed Won (MTD)</p>
                    <p className="text-3xl font-black text-white">{stats.won}</p>
                </div>

                <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            <Users size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-[#EF4444] text-[10px] font-black uppercase tracking-widest bg-[#EF4444]/10 px-2 py-1 rounded-lg">
                            <ArrowDownRight size={12} /> -5%
                        </span>
                    </div>
                    <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Lost Deals</p>
                    <p className="text-3xl font-black text-white">{stats.lost}</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Funnel Chart */}
                <div className="col-span-8 luxury-card p-10 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-2">Entonnoir de Conversion SQL</h3>
                            <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-widest italic opacity-60">Analyse volumétrique par étape de vente</p>
                        </div>
                        <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/5">
                            <button className="px-5 py-2 bg-[#1C1F26] border border-[#2D323B] rounded-lg text-[10px] font-black text-[#D4AF37] shadow-xl uppercase tracking-widest">Volume</button>
                            <button className="px-5 py-2 text-[10px] font-black text-[#6B6B63] hover:text-white transition-colors uppercase tracking-widest">Valeur</button>
                        </div>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ left: 100 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#6B6B63' }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: '#1C1F26', borderRadius: '12px', border: '1px solid #2D323B', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontSize: '11px', color: '#fff' }}
                                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="col-span-4 bg-[#1C1F26] p-10 rounded-[32px] border border-[#2D323B] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full -translate-y-32 translate-x-32 blur-[60px]"></div>
                    <div className="flex items-center gap-3 mb-10 relative z-10">
                        <TrendingUp size={20} className="text-[#D4AF37]" strokeWidth={3} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">Rankings Exécutifs 2026</h3>
                    </div>

                    <div className="space-y-8 relative z-10 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {rankings.length > 0 ? rankings.map((person, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xs font-black text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all shadow-xl">
                                            {person.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black tracking-tight group-hover:text-[#D4AF37] transition-colors">{person.name}</p>
                                            <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-widest mt-0.5 opacity-80">
                                                {person.sales > 0 ? `${(person.sales / person.target * 100).toFixed(0)}% de l'Objectif` : 'Objectif en attente'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-white tracking-tighter">CHF {(person.sales / 1000).toFixed(0)}k</p>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((person.sales / person.target) * 100, 100)}%` }}
                                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C158] shadow-[0_0_8px_#D4AF37]"
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white/2 rounded-2xl border border-dashed border-white/10">
                                <Users size={40} className="mx-auto mb-4 text-white/5" />
                                <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-widest">Aucun Vendeur Actif</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onNavigate('commissions')}
                        className="w-full mt-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[#9E9E96] hover:bg-[#D4AF37] hover:text-black hover:border-transparent transition-all flex items-center justify-center gap-2 relative z-10 shadow-xl"
                    >
                        Management Hub <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Performance;
