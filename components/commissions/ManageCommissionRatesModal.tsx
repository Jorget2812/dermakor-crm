import React, { useState, useEffect } from 'react';
import { X, Save, Percent, User, Sliders, CheckSquare, Square, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { salesService } from '../../services/salesService';
import { userService } from '../../services/userService';
import { User as UserType } from '../../services/commissions/types';

interface ManageCommissionRatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManageCommissionRatesModal({ isOpen, onClose, onSuccess }: ManageCommissionRatesModalProps) {
    const [sellers, setSellers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [massUpdating, setMassUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [newRates, setNewRates] = useState<Record<string, string>>({});
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [massRate, setMassRate] = useState<string>('20');

    useEffect(() => {
        if (isOpen) {
            loadSellers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (successMsg || error) {
            const timer = setTimeout(() => {
                setSuccessMsg(null);
                setError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMsg, error]);

    async function loadSellers() {
        setLoading(true);
        try {
            const data = await userService.getSellers();
            setSellers(data);
            const rates: Record<string, string> = {};
            data.forEach(s => {
                rates[s.id] = (s.commissionPercentage || 20).toString();
            });
            setNewRates(rates);
            // Default select all
            setSelectedUsers(new Set(data.map(s => s.id)));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const toggleSelect = (userId: string) => {
        const next = new Set(selectedUsers);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        setSelectedUsers(next);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.size === sellers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(sellers.map(s => s.id)));
        }
    };

    const handleUpdate = async (userId: string) => {
        const rateText = newRates[userId];
        const rate = parseFloat(rateText);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            setError('Porcentaje inválido (0-100)');
            return;
        }

        setUpdating(userId);
        try {
            await salesService.updateUserCommissionRate(userId, rate);
            setSuccessMsg('Porcenaje actualizado correctamente');
            const updatedSellers = sellers.map(s =>
                s.id === userId ? { ...s, commissionPercentage: rate } : s
            );
            setSellers(updatedSellers);
        } catch (err: any) {
            setError('Error: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleMassUpdate = async () => {
        const rate = parseFloat(massRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            setError('Pourcentage en masse invalide');
            return;
        }

        if (selectedUsers.size === 0) {
            setError('Sélectionnez au moins un vendeur');
            return;
        }

        setMassUpdating(true);
        try {
            const promises = [...selectedUsers].map(id =>
                salesService.updateUserCommissionRate(id, rate)
            );
            await Promise.all(promises);

            setSuccessMsg(`Appliqué ${rate}% à ${selectedUsers.size} vendeurs`);

            // Update local state instead of reloading everything
            const updatedSellers = sellers.map(s =>
                selectedUsers.has(s.id) ? { ...s, commissionPercentage: rate } : s
            );
            setSellers(updatedSellers);

            const updatedRates = { ...newRates };
            selectedUsers.forEach(id => {
                updatedRates[id] = rate.toString();
            });
            setNewRates(updatedRates);
        } catch (err: any) {
            setError('Error en actualización masiva: ' + err.message);
        } finally {
            setMassUpdating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-[#0F1115] border border-[#D4AF37]/30 w-full max-w-3xl rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#1C1F26] to-[#0F1115]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Gérer les Pourcentages de Commission</h2>
                        </div>
                        <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.3em] opacity-70">Tableau de Configuration des Incentives</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-[#6B6B63] hover:text-[#D4AF37] transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Mass Update Section */}
                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#D4AF37] text-black rounded-2xl flex items-center justify-center shadow-lg">
                                <Zap size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Application en Masse</h3>
                                <p className="text-[9px] text-[#6B6B63] font-black uppercase">Mettre à jour plusieurs profils instantanément</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative group flex-1 md:flex-initial">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={massRate}
                                    onChange={(e) => setMassRate(e.target.value)}
                                    className="w-full md:w-24 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-center text-white font-black text-lg outline-none focus:border-[#D4AF37] transition-all"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B63] font-black">%</span>
                            </div>
                            <button
                                onClick={handleMassUpdate}
                                disabled={massUpdating || selectedUsers.size === 0}
                                className="flex-1 md:flex-initial px-8 py-3 bg-[#D4AF37] hover:bg-[#A68F54] text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {massUpdating ? (
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>APPLIQUER % EN MASSE</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-black/20 border border-white/5 rounded-[32px] overflow-hidden">
                        <div className="max-h-[40vh] overflow-y-auto custom-scrollbar">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-[#0F1115] z-10">
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="py-4 pl-8 text-left w-12">
                                            <button onClick={toggleSelectAll} className="text-[#6B6B63] hover:text-[#D4AF37] transition-colors">
                                                {selectedUsers.size === sellers.length ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </th>
                                        <th className="text-left py-4 px-4 text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Vendeur</th>
                                        <th className="text-center py-4 text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Actuel %</th>
                                        <th className="text-center py-4 text-[9px] font-black text-[#6B6B63] uppercase tracking-widest underline decoration-[#D4AF37]/40">Nouveau %</th>
                                        <th className="text-right py-4 pr-8 text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : sellers.map(seller => (
                                        <tr key={seller.id} className={`group hover:bg-white/[0.02] transition-colors ${selectedUsers.has(seller.id) ? 'bg-[#D4AF37]/5' : ''}`}>
                                            <td className="py-4 pl-8">
                                                <button onClick={() => toggleSelect(seller.id)} className={`transition-colors ${selectedUsers.has(seller.id) ? 'text-[#D4AF37]' : 'text-[#6B6B63]'}`}>
                                                    {selectedUsers.has(seller.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1C1F26] to-black border border-white/10 flex items-center justify-center text-[#D4AF37] font-black text-[10px] shadow-inner">
                                                        {seller.fullName ? seller.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??'}
                                                    </div>
                                                    <span className="font-extrabold text-white text-xs uppercase tracking-tight">{seller.fullName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center font-black text-[#6B6B63] text-sm">
                                                {seller.commissionPercentage || 20}%
                                            </td>
                                            <td className="py-4 text-center px-4">
                                                <div className="relative inline-block w-20">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.5"
                                                        value={newRates[seller.id] || ''}
                                                        onChange={(e) => setNewRates({ ...newRates, [seller.id]: e.target.value })}
                                                        className="w-full bg-[#1C1F26] border border-[#2D323B] rounded-xl py-2 px-3 text-center text-white font-black text-sm focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all shadow-xl"
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-4 pr-8 text-right">
                                                <button
                                                    onClick={() => handleUpdate(seller.id)}
                                                    disabled={updating === seller.id}
                                                    className="p-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {updating === seller.id ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Save size={16} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer with Messages */}
                <div className="p-8 border-t border-white/5 bg-[#1C1F26] flex justify-between items-center h-20">
                    <div className="flex-1">
                        <AnimatePresence>
                            {successMsg && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[10px] font-black text-[#10B981] uppercase tracking-widest flex items-center gap-2"
                                >
                                    <CheckSquare size={14} /> {successMsg}
                                </motion.p>
                            )}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"
                                >
                                    <X size={14} /> {error}
                                </motion.p>
                            )}
                            {!successMsg && !error && (
                                <p className="text-[9px] text-[#6B6B63] italic">
                                    * Les changements affectent uniquement les nouvelles ventes.
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
