import React, { useState, useEffect } from 'react';
import { X, DollarSign, Package, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { salesService } from '../../services/salesService';
import { userService } from '../../services/userService';
import { prospectService } from '../../services/prospectService';
import { User as UserType, Sale } from '../../services/commissions/types';
import { Prospect } from '../../types';

interface RegisterSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterSaleModal({ isOpen, onClose, onSuccess }: RegisterSaleModalProps) {
    const [sellers, setSellers] = useState<UserType[]>([]);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        sellerId: '',
        prospectId: '',
        saleAmount: '',
        commissionPercentage: '',
        productName: '',
        orderNumber: '',
        trackingMethod: 'manual' as Sale['trackingMethod'],
        saleDate: new Date().toISOString().split('T')[0],
        status: 'confirmed' as Sale['status'],
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    async function loadData() {
        setLoading(true);
        try {
            const [s, p] = await Promise.all([
                userService.getSellers(),
                prospectService.getProspects()
            ]);
            setSellers(s);
            setProspects(p);
        } catch (err: any) {
            setError('Erreur lors du chargement des données: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSellerChange = (id: string) => {
        const seller = sellers.find(s => s.id === id);
        setFormData(prev => ({
            ...prev,
            sellerId: id,
            commissionPercentage: (seller?.commissionPercentage || 20).toString()
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.sellerId || !formData.saleAmount) {
            setError('Veuillez remplir les champs obligatoires');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            // Clean number inputs (handle Swiss commas/apostrophes)
            const cleanAmount = formData.saleAmount.replace(/['\s,]/g, (m) => m === ',' ? '.' : '');
            const cleanPercentage = formData.commissionPercentage.replace(/['\s,]/g, (m) => m === ',' ? '.' : '');

            const amount = Number(cleanAmount);
            const percentage = Number(cleanPercentage);

            if (isNaN(amount)) {
                throw new Error('Le montant de la vente est invalide');
            }

            console.log('Enregistrement de la vente:', { ...formData, amount, percentage });

            await salesService.createSale({
                sellerId: formData.sellerId,
                prospectId: formData.prospectId || undefined,
                saleAmount: amount,
                commissionPercentage: isNaN(percentage) ? 20 : percentage,
                productName: formData.productName,
                orderNumber: formData.orderNumber,
                trackingMethod: formData.trackingMethod,
                saleDate: formData.saleDate,
                status: formData.status,
                notes: formData.notes
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Erreur lors de l’enregistrement:', err);
            setError(err.message || 'Une erreur inconnue est survenue');
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
                className="bg-[#0F1115] border border-[#2D323B] w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1C1F26]">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Enregistrer une Nouvelle Vente</h2>
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1">Génération de commission</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-[#6B6B63] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold font-black">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seller selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Vendeur *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                                <select
                                    value={formData.sellerId}
                                    onChange={(e) => handleSellerChange(e.target.value)}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none appearance-none"
                                    required
                                >
                                    <option value="">Sélectionner un Vendeur</option>
                                    {sellers.map(s => (
                                        <option key={s.id} value={s.id}>{s.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Prospect selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Prospect (Optionnel)</label>
                            <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                                <select
                                    value={formData.prospectId}
                                    onChange={(e) => setFormData({ ...formData, prospectId: e.target.value })}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none appearance-none"
                                >
                                    <option value="">Sélectionner un Prospect</option>
                                    {prospects.map(p => (
                                        <option key={p.id} value={p.id}>{p.companyName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sale Amount */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Montant de la Vente (CHF) *</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                                <input
                                    type="number"
                                    value={formData.saleAmount}
                                    onChange={(e) => setFormData({ ...formData, saleAmount: e.target.value })}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 pl-12 pr-4 text-white font-black focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Commission % */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">% Commission</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 font-black">%</span>
                                <input
                                    type="number"
                                    value={formData.commissionPercentage}
                                    onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 pl-12 pr-4 text-white font-black focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                    placeholder="20"
                                />
                            </div>
                        </div>

                        {/* Product Name */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Produit / Plan</label>
                            <input
                                type="text"
                                value={formData.productName}
                                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-6 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                placeholder="E.g. Pack KRX Full Ligne"
                            />
                        </div>

                        {/* Order Number & Method */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">N° de Commande</label>
                            <input
                                type="text"
                                value={formData.orderNumber}
                                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-6 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                placeholder="ORD-2026-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Méthode de Tracking</label>
                            <select
                                value={formData.trackingMethod}
                                onChange={(e) => setFormData({ ...formData, trackingMethod: e.target.value as any })}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-6 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none appearance-none"
                            >
                                <option value="manual">Manuel (Admin)</option>
                                <option value="code">Code Promo</option>
                                <option value="link">Lien de Parrainage</option>
                                <option value="direct">Direct</option>
                            </select>
                        </div>

                        {/* Date & Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Date de la Vente</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50" size={18} />
                                <input
                                    type="date"
                                    value={formData.saleDate}
                                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                                    className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 pl-12 pr-4 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Statut</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-3 px-6 text-white font-medium focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none appearance-none"
                            >
                                <option value="pending">En attente (En pause)</option>
                                <option value="confirmed">Confirmée (Pour paiement)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#6B6B63] uppercase tracking-widest pl-1">Notes Internes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-2xl py-4 px-6 text-white text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all min-h-[100px]"
                            placeholder="Détails supplémentaires sur la vente..."
                        />
                    </div>
                </form>

                <div className="p-8 border-t border-white/5 bg-[#1C1F26] flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] font-black text-[#6B6B63] uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || loading}
                        className="flex-[2] bg-[#D4AF37] text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <CheckCircle2 size={16} />
                        )}
                        Enregistrer la Vente
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
