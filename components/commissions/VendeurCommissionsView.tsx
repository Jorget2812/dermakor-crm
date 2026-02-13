import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { payoutsService } from '../../services/commissions/payoutsService';
import { CommissionPayout } from '../../services/commissions/types';
import { supabase } from '../../utils/supabase';

export default function VendeurCommissionsView() {
    const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyPayouts();
    }, []);

    async function loadMyPayouts() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await payoutsService.getMyPayouts(user.id);
                setPayouts(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="text-center py-8 text-executive-neutral-500">Chargement de vos commissions...</div>;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Find current month payout or the latest one
    const currentPayout = payouts.find(p => p.month === currentMonth && p.year === currentYear);
    const totalEarnedYear = payouts
        .filter(p => p.year === currentYear && (p.status === 'valide' || p.status === 'paye'))
        .reduce((sum, p) => sum + Number(p.totalCommission), 0);

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end pb-8 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Espace Performance & Commissions</h2>
                    <p className="text-[#6B6B63] text-[10px] font-black uppercase tracking-[0.3em] mt-2">Suivi en temps réel de votre excellence commerciale.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.3em] mb-2">Chiffre d'Affaires 2026</p>
                    <p className="text-4xl font-black text-[#D4AF37] tracking-tighter">CHF {totalEarnedYear.toLocaleString('fr-CH')}</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="luxury-card p-8 shadow-2xl group hover:border-[#D4AF37]/50 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-white/5 rounded-2xl text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                            <DollarSign size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1 rounded-lg uppercase tracking-widest">
                            {new Date().toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase()}
                        </span>
                    </div>
                    <p className="text-[10px] text-[#6B6B63] font-black uppercase tracking-[0.2em] mb-2">Commission Potentielle</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-3">
                        CHF {Number(currentPayout?.totalCommission || 0).toLocaleString('fr-CH')}
                    </h3>
                    <p className="text-[9px] text-[#6B6B63] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md inline-block">
                        DONT {(Number(currentPayout?.commissionPremium || 0)).toLocaleString('fr-CH')} PERFORMANCE ELITE
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-executive-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <TrendingUp className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-executive-neutral-500 font-medium">CA Fermé (Mois)</p>
                    <h3 className="text-2xl font-bold text-executive-neutral-900 mt-1">
                        CHF {Number(currentPayout?.totalRevenueClosed || 0).toLocaleString('fr-CH')}
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                            {currentPayout?.nbDealsStandard || 0} Std
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-executive-gold-100 text-executive-gold-700 rounded font-medium">
                            {currentPayout?.nbDealsPremium || 0} Prm
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-executive-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-lg">
                            <Calendar className="text-emerald-600" size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-executive-neutral-500 font-medium">Dernier Paiement</p>
                    {payouts.filter(p => p.status === 'paye').length > 0 ? (
                        <>
                            <h3 className="text-2xl font-bold text-executive-neutral-900 mt-1">
                                CHF {Number(payouts.find(p => p.status === 'paye')?.totalCommission).toLocaleString('fr-CH')}
                            </h3>
                            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                Versé le {new Date(payouts.find(p => p.status === 'paye')?.paidAt!).toLocaleDateString('fr-FR')}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-executive-neutral-400 mt-1 italic">
                                Aucun versement
                            </h3>
                            <p className="text-xs text-executive-neutral-400 mt-2">
                                En attente de validation
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* History Table */}
            <div className="luxury-card overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/2">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Archives & Validation des Paiements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#0F1115] text-[9px] font-black text-[#6B6B63] uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="p-6 text-left">Séquence Temporelle</th>
                                <th className="p-6 text-right">CA Certifié</th>
                                <th className="p-6 text-center">Volume Deals</th>
                                <th className="p-6 text-right">Montant Exécutif</th>
                                <th className="p-6 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-executive-neutral-100">
                            {payouts.map(payout => (
                                <tr key={payout.id} className="hover:bg-executive-neutral-50/50">
                                    <td className="p-4 font-medium text-executive-neutral-800">
                                        {new Date(payout.year, payout.month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-right font-mono text-executive-neutral-600">
                                        CHF {Number(payout.totalRevenueClosed).toLocaleString('fr-CH')}
                                    </td>
                                    <td className="p-4 text-center text-sm text-executive-neutral-600">
                                        {payout.nbDealsStandard + payout.nbDealsPremium}
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-executive-neutral-900">
                                        CHF {Number(payout.totalCommission).toLocaleString('fr-CH')}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${payout.status === 'valide' || payout.status === 'paye' ? 'bg-emerald-100 text-emerald-800' :
                                            payout.status === 'en_validation' ? 'bg-amber-100 text-amber-800' :
                                                'bg-executive-neutral-100 text-executive-neutral-600'
                                            }`}>
                                            {payout.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
