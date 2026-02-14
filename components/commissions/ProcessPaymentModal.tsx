import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { salesService } from '../../services/salesService';
import { userService } from '../../services/userService';
import { User, Sale } from '../../services/commissions/types';

interface ProcessPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProcessPaymentModal({ isOpen, onClose, onSuccess }: ProcessPaymentModalProps) {
    const [sellers, setSellers] = useState<User[]>([]);
    const [selectedSeller, setSelectedSeller] = useState('');
    const [period, setPeriod] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [paymentMethod, setPaymentMethod] = useState('Virement Bancaire');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadSellers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedSeller) {
            loadPendingSales();
        } else {
            setSales([]);
        }
    }, [selectedSeller, period]);

    async function loadSellers() {
        setLoading(true);
        try {
            const data = await userService.getSellers();
            setSellers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadPendingSales() {
        setLoading(true);
        try {
            // In a real scenario, we might want a specific service method for this.
            // For now, we'll fetch all user sales and filter.
            const allSales = await salesService.getUserSales(selectedSeller);
            const filtered = allSales.filter(s =>
                s.status === 'confirmed' &&
                s.saleDate >= period.start &&
                s.saleDate <= period.end
            );
            setSales(filtered);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const totalToPay = sales.reduce((sum, s) => sum + s.commissionAmount, 0);

    const handleProcessPayment = async () => {
        if (!selectedSeller || sales.length === 0) return;

        setSubmitting(true);
        setError(null);
        try {
            await salesService.processCommissionPayment({
                sellerId: selectedSeller,
                periodStart: period.start,
                periodEnd: period.end,
                totalSales: sales.reduce((sum, s) => sum + s.saleAmount, 0),
                totalCommission: totalToPay,
                paymentMethod,
                notes
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0F1115] border border-[#2D323B] w-full max-w-3xl rounded-[40px] overflow-hidden shadow-2xl"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1C1F26]">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Traiter le Paiement de Commission</h2>
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">Liquidation de Période</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-[#6B6B63] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Selectors */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest px-1">Vendeur</label>
                            <select
                                value={selectedSeller}
                                onChange={(e) => setSelectedSeller(e.target.value)}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-4 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 outline-none appearance-none"
                            >
                                <option value="">Sélectionner un Vendeur</option>
                                {sellers.map(s => (
                                    <option key={s.id} value={s.id}>{s.fullName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest px-1">Du</label>
                                <input
                                    type="date"
                                    value={period.start}
                                    onChange={(e) => setPeriod({ ...period, start: e.target.value })}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-4 text-white font-medium outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest px-1">Au</label>
                                <input
                                    type="date"
                                    value={period.end}
                                    onChange={(e) => setPeriod({ ...period, end: e.target.value })}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-4 text-white font-medium outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest px-1">Mode de Paiement</label>
                            <input
                                type="text"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-4 text-white font-medium outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                                placeholder="E.g. Virement Bancaire, Revolut..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest px-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-4 text-white text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 min-h-[100px]"
                                placeholder="Référence de paiement..."
                            />
                        </div>
                    </div>

                    {/* Summary & Sales List */}
                    <div className="space-y-6">
                        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-3xl p-6 text-center">
                            <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-2">Total à Liquider</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-4xl font-black text-white">CHF {totalToPay.toLocaleString('fr-CH', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <p className="text-[9px] text-[#6B6B63] font-black uppercase mt-4">
                                Basé sur {sales.length} ventes confirmées
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest px-1">Détail des Ventes</label>
                            <div className="bg-[#1C1F26] border border-[#2D323B] rounded-3xl overflow-hidden">
                                {loading ? (
                                    <div className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D4AF37] mx-auto" /></div>
                                ) : sales.length > 0 ? (
                                    <div className="divide-y divide-white/5 max-h-[250px] overflow-y-auto custom-scrollbar">
                                        {sales.map(s => (
                                            <div key={s.id} className="p-4 flex justify-between items-center bg-white/[0.01]">
                                                <div>
                                                    <p className="text-xs font-black text-white uppercase">{s.prospect?.companyName || 'Vente Manuelle'}</p>
                                                    <p className="text-[9px] text-[#6B6B63] font-black uppercase tracking-widest">{new Date(s.saleDate).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-[#D4AF37]">CHF {s.commissionAmount.toLocaleString()}</p>
                                                    <p className="text-[9px] text-[#6B6B63] font-black uppercase">({s.commissionPercentage}%)</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center space-y-2">
                                        <AlertCircle className="mx-auto text-[#6B6B63]" size={24} />
                                        <p className="text-xs text-[#6B6B63] font-medium italic">Aucune vente confirmée pendant cette période.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-[#1C1F26] flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleProcessPayment}
                        disabled={submitting || sales.length === 0}
                        className="flex-[2] bg-[#D4AF37] text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <CreditCard size={16} />
                        )}
                        Marquer comme Payé
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
