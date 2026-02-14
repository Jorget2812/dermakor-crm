import React from 'react';
import { X, TrendingUp, DollarSign, BarChart3, Target, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MonthlyStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalVentas: number;
        comisionTotal: number;
        numVentas: number;
        promedioVenta: number;
    };
}

export default function MonthlyStatsModal({ isOpen, onClose, stats }: MonthlyStatsModalProps) {
    if (!isOpen) return null;

    const currentMonth = new Date().toLocaleString('fr-CH', { month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-[#0F1115] border border-[#D4AF37]/30 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#1C1F26] to-[#0F1115]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Mes Statistiques</h2>
                        </div>
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.3em]">{currentMonth}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-[#6B6B63] hover:text-[#D4AF37] transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 space-y-10">
                    {/* Big Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-[#1C1F26] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign size={40} className="text-[#D4AF37]" />
                            </div>
                            <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-2">Total des Ventes</p>
                            <p className="text-3xl font-black text-white tracking-tighter">
                                <span className="text-[#D4AF37] text-lg mr-1 tracking-normal font-bold">CHF</span>
                                {stats.totalVentas.toLocaleString('fr-CH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-[#1C1F26] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp size={40} className="text-[#D4AF37]" />
                            </div>
                            <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest mb-2">Commissions Nettes</p>
                            <p className="text-3xl font-black text-[#D4AF37] tracking-tighter">
                                <span className="text-white opacity-30 text-lg mr-1 tracking-normal font-bold">CHF</span>
                                {stats.comisionTotal.toLocaleString('fr-CH', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-2 gap-6 pb-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                                <Target size={22} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Transactions</p>
                                <p className="text-xl font-black text-white">{stats.numVentas}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                                <BarChart3 size={22} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Panier Moyen</p>
                                <p className="text-xl font-black text-white">
                                    <span className="text-[10px] text-[#6B6B63] mr-1 underline decoration-[#D4AF37]">CHF</span>
                                    {stats.promedioVenta.toLocaleString('fr-CH', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Future placeholders info */}
                    <div className="p-6 bg-[#D4AF37]/5 rounded-3xl border border-[#D4AF37]/20 flex items-start gap-4">
                        <div className="p-2 bg-[#D4AF37] text-black rounded-lg">
                            <ArrowUpRight size={16} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-tight mb-1">Performance Details Arrivant Bientôt</p>
                            <p className="text-[10px] text-[#6B6B63] font-medium leading-relaxed">
                                Le prochain module inclura des graphiques de progression quotidiens, l'analyse du Top Produit et des métriques de conversion en temps réel.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-[#1C1F26] text-center">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    >
                        Fermer le Rapport
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
