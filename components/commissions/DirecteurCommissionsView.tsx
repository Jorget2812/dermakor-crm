import React, { useState, useEffect } from 'react';
import { Settings, Save, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { commissionsService } from '../../services/commissions/commissionsService';
import { CommissionRule } from '../../services/commissions/types';
import ValidationPayoutsTab from './ValidationPayoutsTab';

export default function DirecteurCommissionsView() {
    const [activeTab, setActiveTab] = useState<'config' | 'validation'>('config');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [rule, setRule] = useState<Partial<CommissionRule>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRule();
    }, [selectedMonth, selectedYear]);

    async function loadRule() {
        setLoading(true);
        setError(null);
        try {
            const data = await commissionsService.getRule(selectedMonth, selectedYear);
            setRule(data || createDefaultRule());
        } catch (err: any) {
            console.error(err);
            setError('Erreur lors du chargement des règles');
        } finally {
            setLoading(false);
        }
    }

    function createDefaultRule(): Partial<CommissionRule> {
        return {
            month: selectedMonth,
            year: selectedYear,
            standardCommissionPct: 8.00,
            premiumCommissionPct: 12.00,
            standardVolumeBonusPct: 2.00,
            standardVolumeThreshold: 5,
            premiumVolumeBonusPct: 3.00,
            premiumVolumeThreshold: 3,
            objectiveAmount: 30000,
            bonus100_110: 500,
            bonus111_125: 1000,
            bonusAbove125: 1500,
            slaThresholdPct: 95,
            slaBonusAmount: 300,
            firstPremiumBonus: 200,
            exclusivityBonus: 800,
            largeDealThreshold: 50000,
            largeDealBonus: 1200,
            isActive: true
        };
    }

    async function saveRule() {
        setLoading(true);
        try {
            await commissionsService.saveRule(rule);
            await loadRule();
            alert('Règles enregistrées avec succès');
        } catch (err: any) {
            console.error(err);
            alert('Erreur: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function duplicateToNextMonth() {
        if (!rule.id) return alert('Veuillez d\'abord enregistrer la règle actuelle');
        try {
            setLoading(true);
            await commissionsService.duplicateRuleToNextMonth(rule as CommissionRule);

            // Switch to next month
            const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
            const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
            setSelectedMonth(nextMonth);
            setSelectedYear(nextYear);

            alert(`Règles dupliquées vers ${nextMonth}/${nextYear}`);
        } catch (err: any) {
            alert('Erreur: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">Management des Commissions <span className="text-[#D4AF37]">V-ELITE</span></h2>
                <div className="flex gap-4">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-[#1C1F26] border border-[#2D323B] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i} value={i + 1}>
                                {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-[#1C1F26] border border-[#2D323B] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-10 border-b border-white/5 bg-[#1C1F26]/30 px-6 rounded-t-3xl backdrop-blur-md">
                <button
                    onClick={() => setActiveTab('config')}
                    className={`pb-5 pt-6 px-1 flex items-center gap-3 transition-all relative ${activeTab === 'config'
                        ? 'text-[#D4AF37]'
                        : 'text-[#6B6B63] hover:text-white'
                        }`}
                >
                    <Settings size={18} className={activeTab === 'config' ? 'animate-spin-slow' : ''} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configuration Systémique</span>
                    {activeTab === 'config' && (
                        <motion.div layoutId="commTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('validation')}
                    className={`pb-5 pt-6 px-1 flex items-center gap-3 transition-all relative ${activeTab === 'validation'
                        ? 'text-[#D4AF37]'
                        : 'text-[#6B6B63] hover:text-white'
                        }`}
                >
                    <CheckCircle2 size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Validation Versement</span>
                    {activeTab === 'validation' && (
                        <motion.div layoutId="commTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]" />
                    )}
                </button>
            </div>

            {loading && <div className="text-center py-4 text-executive-neutral-500">Chargement...</div>}

            {!loading && activeTab === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    {/* Taux de Base */}
                    <div className="luxury-card p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">⚖️ Taux & Quotients</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <p className="font-black text-[10px] text-white uppercase tracking-[0.2em] mb-4 bg-white/5 p-2 rounded-lg inline-block">Plan Standard</p>
                                    <div>
                                        <label className="block text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-1.5">Commission (%)</label>
                                        <input type="number" step="0.5" className="w-full bg-[#0F1115] border border-[#2D323B] rounded-xl px-4 py-3 text-right font-black text-white outline-none focus:border-[#D4AF37]/50"
                                            value={rule.standardCommissionPct}
                                            onChange={e => setRule({ ...rule, standardCommissionPct: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-1.5">Bonus Vol. (%)</label>
                                        <input type="number" step="0.5" className="w-full bg-[#0F1115] border border-[#2D323B] rounded-xl px-4 py-3 text-right font-black text-white outline-none focus:border-[#D4AF37]/50"
                                            value={rule.standardVolumeBonusPct}
                                            onChange={e => setRule({ ...rule, standardVolumeBonusPct: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-1.5">Seuil (Unités)</label>
                                        <input type="number" className="w-full bg-[#0F1115] border border-[#2D323B] rounded-xl px-4 py-3 text-right font-black text-white outline-none focus:border-[#D4AF37]/50"
                                            value={rule.standardVolumeThreshold}
                                            onChange={e => setRule({ ...rule, standardVolumeThreshold: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="font-black text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] mb-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-2 rounded-lg inline-block">Plan Premium Elite</p>
                                    <div>
                                        <label className="block text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-1.5">Commission (%)</label>
                                        <input type="number" step="0.5" className="w-full bg-[#0F1115] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-right font-black text-[#D4AF37] outline-none"
                                            value={rule.premiumCommissionPct}
                                            onChange={e => setRule({ ...rule, premiumCommissionPct: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-1.5">Bonus Vol. (%)</label>
                                        <input type="number" step="0.5" className="w-full bg-[#0F1115] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-right font-black text-[#D4AF37] outline-none"
                                            value={rule.premiumVolumeBonusPct}
                                            onChange={e => setRule({ ...rule, premiumVolumeBonusPct: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-[#6B6B63] uppercase tracking-widest mb-1.5">Seuil (Unités)</label>
                                        <input type="number" className="w-full bg-[#0F1115] border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-right font-black text-[#D4AF37] outline-none"
                                            value={rule.premiumVolumeThreshold}
                                            onChange={e => setRule({ ...rule, premiumVolumeThreshold: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Objectifs */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-executive-neutral-100">
                        <h3 className="font-serif font-bold text-lg mb-4 text-executive-neutral-800 border-b pb-2">🎯 Objectifs & Performance</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-executive-neutral-700 mb-1">Objectif Mensuel (CHF)</label>
                                <input type="number" className="w-full border border-executive-neutral-300 rounded-lg px-4 py-2 font-mono text-lg font-bold text-executive-neutral-900"
                                    value={rule.objectiveAmount}
                                    onChange={e => setRule({ ...rule, objectiveAmount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs text-executive-neutral-400 mb-1">Bonus 100%</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-right font-mono"
                                        value={rule.bonus100_110}
                                        onChange={e => setRule({ ...rule, bonus100_110: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-executive-neutral-400 mb-1">Bonus 111%</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-right font-mono"
                                        value={rule.bonus111_125}
                                        onChange={e => setRule({ ...rule, bonus111_125: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-executive-neutral-400 mb-1">Bonus 125%+</label>
                                    <input type="number" className="w-full border rounded-lg px-3 py-2 text-right font-mono"
                                        value={rule.bonusAbove125}
                                        onChange={e => setRule({ ...rule, bonusAbove125: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bonus Spéciaux */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-executive-neutral-100 lg:col-span-2">
                        <h3 className="font-serif font-bold text-lg mb-4 text-executive-neutral-800 border-b pb-2">🏆 Bonus Spéciaux</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-executive-neutral-700 mb-1">Premier Premium (CHF)</label>
                                <input type="number" className="w-full border rounded-lg px-3 py-2 font-mono"
                                    value={rule.firstPremiumBonus}
                                    onChange={e => setRule({ ...rule, firstPremiumBonus: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-executive-neutral-700 mb-1">Exclusivité (CHF)</label>
                                <input type="number" className="w-full border rounded-lg px-3 py-2 font-mono"
                                    value={rule.exclusivityBonus}
                                    onChange={e => setRule({ ...rule, exclusivityBonus: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-executive-neutral-700 mb-1">Large Deal Trigger (CHF)</label>
                                <input type="number" className="w-full border rounded-lg px-3 py-2 font-mono"
                                    value={rule.largeDealThreshold}
                                    onChange={e => setRule({ ...rule, largeDealThreshold: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-executive-neutral-700 mb-1">Large Deal Bonus (CHF)</label>
                                <input type="number" className="w-full border rounded-lg px-3 py-2 font-mono"
                                    value={rule.largeDealBonus}
                                    onChange={e => setRule({ ...rule, largeDealBonus: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex justify-end gap-4 pt-4">
                        <button
                            onClick={duplicateToNextMonth}
                            className="px-6 py-3 border border-executive-neutral-300 rounded-xl text-executive-neutral-600 font-medium hover:bg-executive-neutral-50 flex items-center gap-2 transition-all"
                        >
                            <Copy size={18} />
                            Dupliquer (Mois Suivant)
                        </button>
                        <button
                            onClick={saveRule}
                            className="px-6 py-3 bg-executive-gold-500 text-white rounded-xl font-bold hover:bg-executive-gold-600 flex items-center gap-2 shadow-lg shadow-executive-gold-500/20 transition-all"
                        >
                            <Save size={18} />
                            Enregistrer Configuration
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'validation' && (
                <ValidationPayoutsTab month={selectedMonth} year={selectedYear} />
            )}
        </div>
    );
}
