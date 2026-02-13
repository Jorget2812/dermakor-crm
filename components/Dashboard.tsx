import React, { useMemo, useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  AlertCircle,
  ShieldAlert,
  Users,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Prospect, PipelineStage, PotentialMonthly } from '../types';
import { supabase } from '../utils/supabase';

interface DashboardProps {
  leads: Prospect[];
}

const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});

  // Fetch seller names
  useEffect(() => {
    const fetchSellers = async () => {
      const userIds = Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))) as string[];
      if (userIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (data) {
        const names: Record<string, string> = {};
        data.forEach((p: any) => {
          names[p.id] = p.full_name;
        });
        setSellerNames(names);
      }
    };
    fetchSellers();
  }, [leads]);

  // --- Strategic Calculations ---

  // 1. Leads Actifs (Excluding Closed)
  const activeLeads = leads.filter(l => l.pipelineStage !== PipelineStage.FERME_GAGNE && l.pipelineStage !== PipelineStage.FERME_PERDU);

  // 2. Weighted Pipeline
  const getPotentialValue = (p: PotentialMonthly | any): number => {
    const map: Record<string, number> = {
      'moins_5k': 2500,
      '5k_10k': 7500,
      '10k_15k': 12500,
      '15k_25k': 20000,
      '25k_40k': 32500,
      'plus_40k': 50000
    };
    return map[p] || 0;
  };

  const weightedTotal = leads.reduce((sum, l) => {
    if (l.isClosed) return sum;
    const prob = l.probabilityClose || 0;
    const val = Number(l.estimatedDealValue) || getPotentialValue(l.potentialMonthly);
    return sum + (val * (prob / 100));
  }, 0);

  // 3. CA Fermé MTD (Real calculation)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const caClosedMTD = leads
    .filter(l => l.closeStatus === 'gagne' && l.closeDate && new Date(l.closeDate) >= startOfMonth)
    .reduce((sum, l) => sum + Number(l.finalDealValue || 0), 0);

  // 4. Premium Mix
  const premiumLeadsCount = leads.filter(l => l.isPremiumCandidate).length;
  const premiumMix = leads.length > 0 ? Math.round((premiumLeadsCount / leads.length) * 100) : 0;

  // 5. Avg Sales Cycle (Days) - for Won deals
  const wonDeals = leads.filter(l => l.closeStatus === 'gagne' && l.closeDate);
  const avgCycle = wonDeals.length > 0
    ? Math.round(wonDeals.reduce((sum, l) => {
      const start = new Date(l.createdAt);
      const end = new Date(l.closeDate!);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }, 0) / wonDeals.length)
    : 0;

  // 6. Global Conversion Rate
  const closedDeals = leads.filter(l => l.isClosed);
  const conversionRate = closedDeals.length > 0
    ? ((wonDeals.length / closedDeals.length) * 100).toFixed(1)
    : '0.0';

  // --- Dynamic Forecast Data ---
  // Simple projection based on expectedCloseDate
  const forecastData = useMemo(() => {
    const months: Record<string, number> = {};
    // Init next 4 months
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const key = d.toLocaleString('fr-FR', { month: 'short' });
      months[key] = 0;
    }

    activeLeads.forEach(l => {
      if (l.expectedCloseDate) {
        const d = new Date(l.expectedCloseDate);
        const key = d.toLocaleString('fr-FR', { month: 'short' });
        if (months[key] !== undefined) {
          const val = Number(l.estimatedDealValue) || getPotentialValue(l.potentialMonthly);
          months[key] += val * ((l.probabilityClose || 0) / 100);
        }
      }
    });

    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [activeLeads]);


  // --- Dynamic Performance Vendeurs ---
  const sellerPerformance = useMemo(() => {
    const stats: Record<string, { name: string, revenue: number, won: number, total: number, active: number }> = {};

    leads.forEach(l => {
      const sellerId = l.assignedTo || 'unassigned';
      const sellerName = sellerNames[sellerId] || (sellerId === 'unassigned' ? 'Non Assigné' : 'Chargement...');

      if (!stats[sellerId]) stats[sellerId] = { name: sellerName, revenue: 0, won: 0, total: 0, active: 0 };

      stats[sellerId].total++;
      if (l.closeStatus === 'gagne') {
        stats[sellerId].won++;
        stats[sellerId].revenue += Number(l.finalDealValue || 0);
      }
      if (!l.isClosed) {
        stats[sellerId].active++;
      }
    });

    return Object.values(stats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5
  }, [leads, sellerNames]);


  // --- Dynamic Alerts ---
  const criticalAlerts = useMemo(() => {
    const alerts = [];

    // 1. Premium sans contact > 48h
    const untouchedPremium = leads.filter(l =>
      l.isPremiumCandidate &&
      !l.isClosed &&
      l.updatedAt &&
      (new Date().getTime() - new Date(l.updatedAt).getTime()) > (48 * 60 * 60 * 1000)
    );
    if (untouchedPremium.length > 0) {
      const valueAtRisk = untouchedPremium.reduce((sum, l) => sum + (Number(l.estimatedDealValue) || getPotentialValue(l.potentialMonthly)), 0);
      alerts.push({
        type: 'error',
        msg: `${untouchedPremium.length} leads Premium sans contact depuis >48h`,
        sub: `Impact estimé: CHF ${valueAtRisk.toLocaleString()} de pipeline à risque`,
        action: 'Arbitrer'
      });
    }

    // 2. Négociations bloquées > 45 jours
    const stuckNego = leads.filter(l =>
      l.pipelineStage === PipelineStage.NEGOCIATION &&
      l.pipelineStageEnteredAt &&
      (new Date().getTime() - new Date(l.pipelineStageEnteredAt).getTime()) > (45 * 24 * 60 * 60 * 1000)
    );
    if (stuckNego.length > 0) {
      alerts.push({
        type: 'warning',
        msg: `${stuckNego.length} négociations bloquées depuis >45 jours`,
        sub: 'Conseil IA: Envoyer template "Relance Stratégique"',
        action: 'Voir'
      });
    }

    return alerts;
  }, [leads]);

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">

      {/* KPI Section 1: Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
              <Users size={24} />
            </div>
            <span className="text-[#10B981] font-black text-[10px] tracking-widest bg-[#10B981]/10 px-2 py-1 rounded-lg">
              LIVE
            </span>
          </div>
          <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-[0.2em]">Leads Actifs</p>
          <p className="text-4xl font-black text-white mt-2 tracking-tight">{activeLeads.length}</p>
        </div>

        <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
              <TrendingUp size={24} />
            </div>
            <span className="text-[#9E9E96] font-black text-[10px] tracking-widest bg-white/5 px-2 py-1 rounded-lg">PONDÉRÉ</span>
          </div>
          <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-[0.2em]">Strategy Ecosystem</p>
          <p className="text-4xl font-black text-white mt-2 tracking-tight">CHF {Math.round(weightedTotal).toLocaleString()}</p>
        </div>

        <div className="luxury-card p-6 shadow-2xl hover:border-[#D4AF37]/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
              <DollarSign size={24} />
            </div>
            <span className="text-[#10B981] font-black text-[10px] tracking-widest bg-[#10B981]/10 px-2 py-1 rounded-lg">CE MOIS</span>
          </div>
          <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-[0.2em]">CA Fermé MTD</p>
          <p className="text-4xl font-black text-white mt-2 tracking-tight">CHF {caClosedMTD.toLocaleString()}</p>
        </div>
      </div>

      {/* KPI Section 2: Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#1C1F26] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Taux de Conversion</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-[#D4AF37]">{conversionRate}%</p>
            <span className="text-[#6B6B63] font-bold text-[10px] mb-1.5 uppercase tracking-widest">Global SQL</span>
          </div>
        </div>
        <div className="bg-[#1C1F26] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Cycle Moyen (Won)</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-[#D4AF37]">{avgCycle}j</p>
            <span className="text-[#6B6B63] font-bold text-[10px] mb-1.5 uppercase tracking-widest">Jours Moy.</span>
          </div>
        </div>
        <div className="bg-[#1C1F26] p-6 rounded-2xl border border-white/5 shadow-2xl">
          <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Premium Mix</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-[#D4AF37]">{premiumMix}%</p>
            <span className="text-[#6B6B63] font-bold text-[10px] mb-1.5 uppercase tracking-widest">Qualification</span>
          </div>
        </div>
      </div>

      {/* Alertes Critiques Section */}
      <div className="luxury-card overflow-hidden shadow-2xl">
        <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#EF4444]" />
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Alertes de Management</h3>
          </div>
          <span className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-black px-3 py-1 rounded-lg tracking-widest">{criticalAlerts.length} ACTIONS CRITIQUES</span>
        </div>
        <div className="p-2">
          {criticalAlerts.length === 0 && (
            <div className="p-8 text-center text-[#6B6B63] italic font-bold tracking-wide">
              Système sous contrôle. Aucune anomalie détectée.
            </div>
          )}
          {criticalAlerts.map((alert, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-6 p-4 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
                <div className={`w-2 h-2 rounded-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`}></div>
                <div className="flex-1">
                  <p className="text-sm font-black text-white tracking-tight">{alert.msg}</p>
                  <p className="text-xs text-[#9E9E96] font-semibold mt-0.5">{alert.sub}</p>
                </div>
                <button className="flex items-center gap-1 text-[#D4AF37] font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  {alert.action} <ChevronRight size={14} />
                </button>
              </div>
              {i < criticalAlerts.length - 1 && <div className="h-px bg-white/5 mx-4"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Top Opportunités Table */}
        <div className="col-span-1 lg:col-span-2 luxury-card overflow-hidden shadow-2xl">
          <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#D4AF37]" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">High-Value Opportunities</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-8 py-5 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest">Entreprise</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest text-right">Valeur Est.</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest text-center">Probabilité</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest text-center">Canton</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest text-center">Écosystème</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest">Assigné à</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads
                  .filter(l => l.isPremiumCandidate && !l.isClosed)
                  .sort((a, b) => (Number(b.estimatedDealValue) || 0) - (Number(a.estimatedDealValue) || 0))
                  .slice(0, 5)
                  .map(lead => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-all cursor-pointer group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-white group-hover:text-[#D4AF37] transition-colors tracking-tight">{lead.companyName}</p>
                        <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-widest mt-0.5">{lead.contactFirstName} {lead.contactLastName}</p>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-white tracking-tighter">CHF {(Number(lead.estimatedDealValue) || getPotentialValue(lead.potentialMonthly)).toLocaleString()}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-white font-black text-xs tracking-widest opacity-80">{lead.probabilityClose}%</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-[#D4AF37] font-black text-[10px] tracking-widest border border-[#D4AF37]/30 px-2 py-0.5 rounded-md">{lead.canton}</span>
                      </td>
                      <td className="px-8 py-5 text-center uppercase">
                        <span className="bg-white/5 text-[#9E9E96] text-[9px] font-black px-2.5 py-1 rounded-lg tracking-tighter opacity-80">
                          {lead.pipelineStage?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] text-[8px] font-black border border-[#D4AF37]/20 uppercase">
                            {sellerNames[lead.assignedTo || '']?.charAt(0) || 'U'}
                          </div>
                          <span className="text-[10px] font-black text-[#9E9E96] uppercase tracking-widest">{sellerNames[lead.assignedTo || ''] || 'No Asig'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forecast Graph */}
        <div className="luxury-card p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Projection Financial (4m)</h3>
              <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-widest mt-1.5 italic">Real-time dynamic SQL forecast</p>
            </div>
            <div className="bg-white/5 p-1 px-3 rounded-lg border border-white/5">
              <span className="text-[#D4AF37] text-[9px] font-black tracking-widest">CHART V-Elite</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: '#6B6B63', fontWeight: 800 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1F26', borderRadius: '12px', border: '1px solid #2D323B', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Vendeurs Table */}
        <div className="luxury-card p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Vendeur Rankings</h3>
              <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-widest mt-1.5 italic">Sort by Closed Revenue (SQL)</p>
            </div>
          </div>
          <div className="space-y-6">
            {sellerPerformance.length === 0 && <p className="text-xs text-[#6B6B63] font-bold uppercase italic p-4 text-center">Aucune donnée de performance SQL.</p>}
            {sellerPerformance.map((seller, i) => {
              const convRatio = seller.total > 0 && (seller.won / seller.total) * 100;
              return (
                <div key={i} className="flex items-center gap-5 group cursor-pointer p-2 hover:bg-white/2 rounded-xl transition-all">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center font-black text-[#6B6B63] text-xs border border-white/5 group-hover:border-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-all">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-white tracking-tight group-hover:text-[#D4AF37] transition-colors">
                      {seller.name}
                    </p>
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-60">
                      <span className="text-[#10B981]">{convRatio ? convRatio.toFixed(0) : 0}% Conv.</span>
                      <span className="text-white/10">•</span>
                      <span className="text-[#9E9E96]">{seller.active} Actifs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white tracking-tighter">CHF {seller.revenue.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
