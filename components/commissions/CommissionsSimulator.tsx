import React, { useMemo, useState } from 'react';
import { Prospect, PipelineStage } from '../../types';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Calculator,
    Settings2,
    Calendar,
    ArrowUpRight,
    PieChart as PieChartIcon,
    Wallet,
    Download
} from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from 'recharts';

interface CommissionsProps {
    leads: Prospect[];
    onBack?: () => void;
}

const CommissionsSimulator: React.FC<CommissionsProps> = ({ leads, onBack }) => {
    const [commissionRate, setCommissionRate] = useState(10); // Default 10%
    const [monthlyGoal, setMonthlyGoal] = useState(100000);

    // 1. Calculate Realized CA (FERME_GAGNE)
    const realizedCA = useMemo(() => {
        return leads
            .filter(l => l.pipelineStage === PipelineStage.FERME_GAGNE)
            .reduce((sum, l) => sum + (Number(l.finalDealValue) || Number(l.estimatedDealValue) || 0), 0);
    }, [leads]);

    // 2. Calculate Pending CA (NEGOCIATION, PROPOSITION)
    const pendingCA = useMemo(() => {
        const potentialStages = [PipelineStage.NEGOCIATION, PipelineStage.PROPOSITION, PipelineStage.QUALIFIE];
        return leads
            .filter(l => potentialStages.includes(l.pipelineStage))
            .reduce((sum, l) => sum + ((Number(l.estimatedDealValue) || 0) * ((l.probabilityClose || 0) / 100)), 0);
    }, [leads]);

    const totalCalculatedCommission = (realizedCA * commissionRate) / 100;

    const data = [
        { name: 'Réalisé', value: realizedCA, color: '#C0A76A' },
        { name: 'Pondéré', value: pendingCA, color: '#2D2D29' },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header with Settings */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    {onBack && (
                        <button onClick={onBack} className="text-sm text-executive-neutral-500 hover:text-executive-neutral-800 mb-2">
                            ← Retour aux Commissions
                        </button>
                    )}
                    <h2 className="text-3xl font-black text-executive-neutral-800">Simulateur de Revenus</h2>
                    <p className="text-executive-neutral-400 font-medium text-sm">Simulation basée sur le pipeline actuel (non contractuel)</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white border border-executive-neutral-200 px-5 py-3 rounded-2xl flex items-center gap-3">
                        <Settings2 size={16} className="text-executive-neutral-400" />
                        <div>
                            <p className="text-[9px] font-bold text-executive-neutral-400 uppercase tracking-widest">Taux Commission</p>
                            <input
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-12 text-sm font-black text-executive-neutral-800 outline-none"
                            />
                            <span className="text-sm font-bold">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Commission Card */}
                <div className="col-span-12 lg:col-span-7 bg-executive-neutral-800 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-executive-gold-500/10 rounded-full -translate-y-40 translate-x-40 blur-3xl"></div>

                    <div className="flex justify-between items-start mb-16 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/5 rounded-2xl text-executive-gold-500">
                                <Wallet size={24} />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Projection Variable</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-executive-neutral-400 uppercase tracking-widest mb-1">Période</p>
                            <p className="text-sm font-bold flex items-center gap-2">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} <Calendar size={14} className="text-executive-gold-500" /></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 items-end relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-executive-neutral-400 uppercase tracking-widest mb-3">Total Commission Estimée</p>
                            <p className="text-6xl font-black text-executive-gold-500 mb-2">CHF {totalCalculatedCommission.toLocaleString('fr-CH', { maximumFractionDigits: 0 })}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-executive-neutral-400 uppercase tracking-widest mb-2">Chiffre d'Affaire Réalisé</p>
                                <p className="text-xl font-bold">CHF {realizedCA.toLocaleString('fr-CH')}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-executive-neutral-400 uppercase tracking-widest mb-2">CA Pondéré (Prévisionnel)</p>
                                <p className="text-xl font-bold text-executive-neutral-300">CHF {pendingCA.toLocaleString('fr-CH')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie Chart Analysis */}
                <div className="col-span-12 lg:col-span-5 bg-white rounded-[40px] p-10 border border-executive-neutral-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <PieChartIcon size={20} className="text-executive-gold-500" />
                        <h3 className="text-sm font-bold text-executive-neutral-800 uppercase tracking-widest">Répartition CA</h3>
                    </div>

                    <div className="h-[250px] mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {data.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-executive-neutral-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-xs font-bold text-executive-neutral-800 uppercase tracking-tight">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-executive-neutral-800">{((item.value / ((realizedCA + pendingCA) || 1)) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionsSimulator;
