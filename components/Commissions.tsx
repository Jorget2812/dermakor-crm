import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, Users, CreditCard,
    Copy, Share2, ExternalLink, Filter,
    Plus, Settings, BarChart3, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { salesService } from '../services/salesService';
import { Sale, ReferralCode } from '../services/commissions/types';

// Modals
import RegisterSaleModal from './commissions/RegisterSaleModal';
import ManageCommissionRatesModal from './commissions/ManageCommissionRatesModal';
import ProcessPaymentModal from './commissions/ProcessPaymentModal';
import MonthlyStatsModal from './commissions/MonthlyStatsModal';

const Commissions: React.FC = () => {
    const { user, role } = useAuth();
    const isDirector = role === 'directeur' || role === 'director';

    // UI State
    const [activeTab, setActiveTab] = useState<'seller' | 'director'>(isDirector ? 'director' : 'seller');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingReferral, setGeneratingReferral] = useState(false);

    // Data State
    const [sales, setSales] = useState<Sale[]>([]);
    const [referral, setReferral] = useState<ReferralCode | null>(null);
    const [stats, setStats] = useState({
        totalVentas: 0,
        comisionTotal: 0,
        confirmadas: 0,
        pendientes: 0,
        pagadas: 0
    });
    const [monthlyStats, setMonthlyStats] = useState({
        totalVentas: 0,
        comisionTotal: 0,
        numVentas: 0,
        promedioVenta: 0
    });

    // Modals state
    const [modals, setModals] = useState({
        register: false,
        manageRates: false,
        processPayment: false,
        monthlyStats: false
    });

    useEffect(() => {
        loadDashboardData();
    }, [activeTab, user]);

    async function loadDashboardData() {
        if (!user) return;
        setLoading(true);
        try {
            if (activeTab === 'seller') {
                setGeneratingReferral(true);
                const [userSales, userReferral, userStats, mStats] = await Promise.all([
                    salesService.getUserSales(user.id),
                    salesService.getOrCreateReferralCode(user.id, user.user_metadata?.full_name || user.user_metadata?.fullName || 'Vendedor'),
                    salesService.getSalesStats(user.id),
                    salesService.getMonthlyStats(user.id)
                ]);
                setSales(userSales);
                setReferral(userReferral);
                setStats(userStats);
                setMonthlyStats(mStats);
                setGeneratingReferral(false);
            } else {
                const [allSales, globalStats, mStats] = await Promise.all([
                    salesService.getAllSales(),
                    salesService.getSalesStats(),
                    salesService.getMonthlyStats()
                ]);
                setSales(allSales);
                setStats(globalStats);
                setMonthlyStats(mStats);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles');
    };

    if (loading && sales.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.3em] animate-pulse">Chargement Executive Dash...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700">
            {/* Header section with Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Commissions & Performance</h1>
                    <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.4em] mt-1">Ecosystème de Ventes Dermakor</p>
                </div>

                <div className="flex bg-[#1C1F26] p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('seller')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'seller' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-[#6B6B63] hover:text-white'}`}
                    >
                        Mon Dashboard
                    </button>
                    {isDirector && (
                        <button
                            onClick={() => setActiveTab('director')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'director' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-[#6B6B63] hover:text-white'}`}
                        >
                            Direction
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setModals({ ...modals, monthlyStats: true })}
                    className="group relative flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#A68F54] text-black rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                    <BarChart3 size={18} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Mes Stats</span>
                </button>
            </div>

            {activeTab === 'seller' ? (
                /* SELLER VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Referral & Stats */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Referral Card */}
                        <section className="bg-gradient-to-br from-[#1C1F26] to-[#0F1115] border border-white/5 rounded-[40px] p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#D4AF37]/10 transition-colors" />
                            <h3 className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Share2 size={14} className="text-[#D4AF37]" /> Mon Code de Parrainage
                            </h3>

                            <div className="space-y-6">
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                                    <p className="text-[9px] text-[#6B6B63] font-black uppercase mb-1">Votre Code Unique</p>
                                    {generatingReferral && !referral ? (
                                        <div className="flex items-center gap-2 py-1">
                                            <div className="w-3 h-3 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                                            <span className="text-[10px] text-[#D4AF37] font-black uppercase animate-pulse">Généralion...</span>
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-black text-white tracking-widest uppercase">{referral?.code || '---'}</p>
                                    )}
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                                    <p className="text-[9px] text-[#6B6B63] font-black uppercase mb-1">Lien Direct</p>
                                    <p className="text-[11px] font-medium text-white/50 truncate mb-4">{referral?.link || '---'}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(referral?.link || '')}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Copy size={12} /> Copier
                                        </button>
                                        <button className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] p-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                                            <Share2 size={12} /> WhatsApp
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <p className="text-[8px] text-[#6B6B63] font-black uppercase mb-1">Clics</p>
                                        <p className="text-xl font-black text-white">{referral?.clicks || 0}</p>
                                    </div>
                                    <div className="text-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <p className="text-[8px] text-[#6B6B63] font-black uppercase mb-1">Conv.</p>
                                        <p className="text-xl font-black text-[#D4AF37]">{referral?.conversions || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Stats Summary */}
                        <section className="bg-gradient-to-br from-[#1C1F26] to-[#0F1115] border border-white/5 rounded-[40px] p-8 shadow-xl">
                            <h3 className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <TrendingUp size={14} className="text-[#D4AF37]" /> Mes Commissions
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] text-[#6B6B63] font-black uppercase mb-1">Potentiel ce mois</p>
                                    <p className="text-4xl font-black text-white tracking-tighter">CHF {stats.comisionTotal.toLocaleString()}</p>
                                    <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-2">Surface de Vente: CHF {stats.totalVentas.toLocaleString()}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <span className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">✅ Confirmées</span>
                                        <span className="text-sm font-black text-white">CHF {stats.confirmadas.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <span className="text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">⏳ En Attente</span>
                                        <span className="text-sm font-black text-white/50">CHF {stats.pendientes.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10">
                                        <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">💳 Déjà Payées</span>
                                        <span className="text-sm font-black text-[#D4AF37]">CHF {stats.pagadas.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sales Table */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-[#1C1F26] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Historique des Ventes</h3>
                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[#6B6B63] transition-all">
                                        <Filter size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-black/20">
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Client / Prospect</th>
                                            <th className="px-8 py-6 text-left text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Produit</th>
                                            <th className="px-8 py-6 text-right text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Commission</th>
                                            <th className="px-8 py-6 text-center text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sales.length > 0 ? sales.map(s => (
                                            <tr key={s.id} className="group hover:bg-white/[0.02] transition-all">
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-bold text-white/60">{new Date(s.saleDate).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-white uppercase tracking-tight">{s.prospect?.company_name || 'Vente Directe'}</span>
                                                        <span className="text-[9px] text-[#6B6B63] font-black uppercase">Ref: {s.orderNumber || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-xs font-medium text-white/80">{s.productName || 'KRX Solution'}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-black text-[#D4AF37]">CHF {s.commissionAmount.toLocaleString()}</span>
                                                        <span className="text-[8px] text-[#6B6B63] font-black uppercase">Basé sur {s.saleAmount.toLocaleString()} ({s.commissionPercentage}%)</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.status === 'confirmed' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' :
                                                        s.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            'bg-white/5 text-[#6B6B63] border-white/10'
                                                        }`}>
                                                        {s.status === 'confirmed' ? 'Confirmée' : s.status === 'paid' ? 'Payée' : 'En Attente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <DollarSign size={32} className="mx-auto text-white/5 mb-4" />
                                                    <p className="text-sm text-[#6B6B63] font-bold italic">Aucune vente enregistrée pour le moment.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            ) : (
                /* DIRECTOR VIEW */
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                    {/* Actions & Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Quick Actions Card */}
                        <section className="lg:col-span-1 bg-gradient-to-br from-[#1C1F26] to-[#0F1115] border border-white/5 rounded-[40px] p-8 shadow-xl">
                            <h3 className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.3em] mb-6">Actions Direction</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => setModals({ ...modals, register: true })}
                                    className="w-full flex items-center justify-between p-4 bg-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all text-black rounded-2xl group"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Enregistrer Vente</span>
                                    <Plus size={18} />
                                </button>
                                <button
                                    onClick={() => setModals({ ...modals, processPayment: true })}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all text-white rounded-2xl group border border-white/5"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Procéder Paiement</span>
                                    <CreditCard size={18} className="text-[#D4AF37]" />
                                </button>
                                <button
                                    onClick={() => setModals({ ...modals, manageRates: true })}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-all text-white rounded-2xl group border border-white/5"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Gestionar Porcentajes (%)</span>
                                    <Settings size={18} className="text-[#D4AF37]" strokeWidth={3} />
                                </button>
                            </div>
                        </section>

                        {/* Financial Summary */}
                        <section className="lg:col-span-3 bg-[#1C1F26] border border-white/5 rounded-[40px] p-8 shadow-xl flex flex-col md:flex-row gap-12 items-center justify-around">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.4em] mb-2">Total Ventas Mes</p>
                                <p className="text-5xl font-black text-white tracking-tighter">CHF {stats.totalVentas.toLocaleString()}</p>
                            </div>

                            <div className="h-20 w-[1px] bg-white/5 hidden md:block" />

                            <div className="text-center">
                                <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.4em] mb-2">Comisiones Totales</p>
                                <p className="text-4xl font-black text-[#D4AF37] tracking-tighter">CHF {stats.comisionTotal.toLocaleString()}</p>
                            </div>

                            <div className="h-20 w-[1px] bg-white/5 hidden md:block" />

                            <div className="text-center md:text-right">
                                <p className="text-[10px] font-black text-[#6B6B63] uppercase tracking-[0.4em] mb-2">Pendiente de Pago</p>
                                <div className="flex items-center justify-center md:justify-end gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500/40 animate-pulse border border-red-500/20" />
                                    <p className="text-4xl font-black text-white tracking-tighter">CHF {stats.pendientes.toLocaleString()}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* All Sales Table */}
                    <section className="bg-[#1C1F26] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/10">
                            <div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Moniteur Global des Commissions</h3>
                                <p className="text-[9px] text-[#6B6B63] font-black uppercase mt-1 tracking-widest">Toutes les transactions commerciales</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="RECHERCHER..."
                                        className="bg-black/20 border border-white/5 rounded-xl px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-[#D4AF37]/40 w-64 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-black/30">
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Vendeur</th>
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Prospect / Client</th>
                                        <th className="px-8 py-6 text-left text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Vente</th>
                                        <th className="px-8 py-6 text-center text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">%</th>
                                        <th className="px-8 py-6 text-right text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Com.</th>
                                        <th className="px-8 py-6 text-center text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">État</th>
                                        <th className="px-8 py-6 text-right text-[9px] font-black text-[#6B6B63] uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sales.length > 0 ? sales.map(s => (
                                        <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors relative">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7333] flex items-center justify-center text-black font-black text-[10px]">
                                                        {s.seller?.fullName?.[0] || 'V'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase">{s.seller?.fullName || 'Inconnu'}</p>
                                                        <p className="text-[8px] text-[#6B6B63] font-black uppercase tracking-tighter">ID: {s.sellerId.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-white uppercase">{s.prospect?.company_name || 'En Attente'}</p>
                                                <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest">{new Date(s.saleDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-black text-white">CHF {s.saleAmount.toLocaleString()}</p>
                                                <p className="text-[8px] text-[#6B6B63] font-black uppercase">{s.productName || 'Solution'}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="text-[10px] font-black text-[#6B6B63]">{s.commissionPercentage}%</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="text-xs font-black text-[#D4AF37]">CHF {s.commissionAmount.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${s.status === 'confirmed' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' :
                                                        s.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            s.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                                'bg-white/5 text-[#6B6B63] border-white/10'
                                                        }`}>
                                                        {s.status === 'confirmed' ? 'Confirmée' : s.status === 'paid' ? 'Payée' : s.status === 'pending' ? 'Attente' : 'Annulée'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#6B6B63] hover:text-white transition-colors">
                                                        <Settings size={14} />
                                                    </button>
                                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#6B6B63] hover:text-[#D4AF37] transition-colors">
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center">
                                                <Users size={32} className="mx-auto text-white/5 mb-4" />
                                                <p className="text-xs text-[#6B6B63] font-bold uppercase tracking-widest">Aucune vente à monitorer</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {/* MODALS */}
            <AnimatePresence>
                {modals.register && (
                    <RegisterSaleModal
                        isOpen={modals.register}
                        onClose={() => setModals({ ...modals, register: false })}
                        onSuccess={() => loadDashboardData()}
                    />
                )}
                {modals.manageRates && (
                    <ManageCommissionRatesModal
                        isOpen={modals.manageRates}
                        onClose={() => setModals({ ...modals, manageRates: false })}
                        onSuccess={() => loadDashboardData()}
                    />
                )}
                {modals.processPayment && (
                    <ProcessPaymentModal
                        isOpen={modals.processPayment}
                        onClose={() => setModals({ ...modals, processPayment: false })}
                        onSuccess={() => loadDashboardData()}
                    />
                )}
                {modals.monthlyStats && (
                    <MonthlyStatsModal
                        isOpen={modals.monthlyStats}
                        onClose={() => setModals({ ...modals, monthlyStats: false })}
                        stats={monthlyStats}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Commissions;
