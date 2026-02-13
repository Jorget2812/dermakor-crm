import React, { useState, useEffect } from 'react';
import { CheckCircle2, Calculator, Loader2 } from 'lucide-react';
import { payoutsService } from '../../services/commissions/payoutsService';
import { calculateCommissionsForMonth } from '../../services/commissions/calculatorService';
import { CommissionPayout } from '../../services/commissions/types';

export default function ValidationPayoutsTab({ month, year }: { month: number; year: number }) {
    const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        loadPayouts();
    }, [month, year]);

    async function loadPayouts() {
        setLoading(true);
        try {
            const data = await payoutsService.getPayoutsForMonth(month, year);
            setPayouts(data as CommissionPayout[]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function runCalculation() {
        setCalculating(true);
        try {
            const result = await calculateCommissionsForMonth(month, year);
            if (result.success) {
                alert(`Calcul terminé avec succès pour ${result.count} vendeurs.`);
                loadPayouts();
            } else {
                alert(`Erreur: ${result.error}`);
            }
        } catch (err: any) {
            alert(`Erreur critique: ${err.message}`);
        } finally {
            setCalculating(false);
        }
    }

    async function validatePayout(payoutId: string) {
        try {
            await payoutsService.validatePayout(payoutId);
            loadPayouts();
        } catch (err: any) {
            alert('Erreur validation: ' + err.message);
        }
    }

    async function validateAll() {
        if (!confirm('Êtes-vous sûr de vouloir valider TOUS les paiements en attente ?')) return;
        try {
            await payoutsService.validateAllPayouts(month, year);
            loadPayouts();
            alert('Toutes les commissions ont été validées');
        } catch (err: any) {
            alert('Erreur: ' + err.message);
        }
    }

    if (loading) return <div className="text-center py-8 text-executive-neutral-500">Chargement des payouts...</div>;

    const totalCA = payouts.reduce((sum, p) => sum + Number(p.totalRevenueClosed || 0), 0);
    const totalComm = payouts.reduce((sum, p) => sum + Number(p.totalCommission || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-executive-neutral-100">
                <div>
                    <h3 className="font-bold text-lg text-executive-neutral-800">
                        Commissions {new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-xs text-executive-neutral-400">
                        {payouts.length} vendeurs éligibles
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={runCalculation}
                        disabled={calculating}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${calculating
                                ? 'bg-executive-neutral-100 text-executive-neutral-400 cursor-not-allowed'
                                : 'bg-executive-neutral-800 text-white hover:bg-black'
                            }`}
                    >
                        {calculating ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
                        {calculating ? 'Calcul en cours...' : 'Lancer Calcul'}
                    </button>

                    <button
                        onClick={validateAll}
                        className="bg-executive-gold-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-executive-gold-600 shadow-lg shadow-executive-gold-500/20"
                    >
                        <CheckCircle2 size={18} />
                        Valider tout
                    </button>
                </div>
            </div>

            <div className="bg-white border border-executive-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-executive-neutral-50 border-b border-executive-neutral-200">
                        <tr>
                            <th className="text-left p-4 text-xs font-bold text-executive-neutral-500 uppercase tracking-wider">Vendeur</th>
                            <th className="text-right p-4 text-xs font-bold text-executive-neutral-500 uppercase tracking-wider">CA Fermé</th>
                            <th className="text-right p-4 text-xs font-bold text-executive-neutral-500 uppercase tracking-wider">Deals (Std/Prm)</th>
                            <th className="text-right p-4 text-xs font-bold text-executive-neutral-500 uppercase tracking-wider">Commission</th>
                            <th className="text-center p-4 text-xs font-bold text-executive-neutral-500 uppercase tracking-wider">Statut</th>
                            <th className="text-center p-4 text-xs font-bold text-executive-neutral-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-executive-neutral-100">
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-executive-neutral-400 italic">
                                    Aucune commission calculée pour cette période. Lancez le calcul.
                                </td>
                            </tr>
                        )}
                        {payouts.map((payout) => (
                            <tr key={payout.id} className="hover:bg-executive-neutral-50/50 transition-colors">
                                <td className="p-4 font-medium text-executive-neutral-800">
                                    {payout.vendeur?.firstName} {payout.vendeur?.lastName}
                                    <span className="block text-xs text-executive-neutral-400 font-normal">{payout.vendeur?.role}</span>
                                </td>
                                <td className="p-4 text-right font-mono text-executive-neutral-600">
                                    CHF {Number(payout.totalRevenueClosed).toLocaleString('fr-CH')}
                                </td>
                                <td className="p-4 text-right text-sm text-executive-neutral-600">
                                    <span className="font-semibold">{payout.nbDealsStandard + payout.nbDealsPremium}</span>
                                    <span className="text-xs text-executive-neutral-400 ml-1">
                                        ({payout.nbDealsStandard} / {payout.nbDealsPremium})
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-executive-neutral-900">
                                    CHF {Number(payout.totalCommission).toLocaleString('fr-CH')}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${payout.status === 'valide' ? 'bg-emerald-100 text-emerald-800' :
                                            payout.status === 'en_validation' ? 'bg-amber-100 text-amber-800' :
                                                'bg-executive-neutral-100 text-executive-neutral-600'
                                        }`}>
                                        {payout.status === 'valide' ? 'Validé' :
                                            payout.status === 'en_validation' ? 'À Valider' :
                                                'En Calcul'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {(payout.status === 'en_validation' || payout.status === 'en_calcul') && (
                                        <button
                                            onClick={() => validatePayout(payout.id)}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium text-xs border border-emerald-200 hover:bg-emerald-50 px-3 py-1 rounded-full transition-all"
                                        >
                                            Valider
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-executive-neutral-50 border-t-2 border-executive-neutral-200">
                        <tr>
                            <td className="p-4 font-bold text-executive-neutral-800">TOTAL PÉRIODE</td>
                            <td className="p-4 text-right font-mono font-bold text-executive-neutral-800">
                                CHF {totalCA.toLocaleString('fr-CH')}
                            </td>
                            <td className="p-4 text-right font-bold text-executive-neutral-800">
                                {payouts.reduce((sum, p) => sum + p.nbDealsStandard + p.nbDealsPremium, 0)}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-lg text-executive-gold-600">
                                CHF {totalComm.toLocaleString('fr-CH')}
                            </td>
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
