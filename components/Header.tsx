import React from 'react';
import { Search, Plus, Bell, ShieldAlert } from 'lucide-react';

interface HeaderProps {
    activeTab: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewLead: () => void;
    error?: string;
}

const Header: React.FC<HeaderProps> = ({
    activeTab,
    searchQuery,
    setSearchQuery,
    onNewLead,
    error
}) => {
    const getTabTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Tableau de Bord';
            case 'pipeline': return "L'Écosystème Partenaires";
            case 'map': return 'Carte Cantonale Suisse';
            case 'academy': return 'Ecosystème Academy';
            case 'performance': return 'Performance Commerciale';
            case 'commissions': return 'Gestion des Commissions';
            case 'settings': return 'Configuration Système';
            default: return 'CRM DermaKor';
        }
    };

    return (
        <header className="flex justify-between items-center mb-10 animate-in slide-in-from-top-4 duration-500">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="h-[2px] w-6 bg-[#D4AF37]"></span>
                    <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] opacity-80">DermaKor Swiss Elite</p>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                    {getTabTitle()}
                </h1>
                <p className="text-[#9E9E96] text-xs mt-1 font-semibold tracking-wide">
                    Sistema de Pilotaje Comercial Estratégico
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B63] group-focus-within:text-[#D4AF37] transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher partenaire o región..."
                        className="pl-12 pr-6 py-3 bg-[#1C1F26] border border-[#2D323B] rounded-2xl text-sm font-bold text-white placeholder-[#6B6B63] outline-none w-80 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all shadow-2xl shadow-black/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-3 bg-[#1C1F26] border border-[#2D323B] rounded-xl text-[#9E9E96] hover:text-white hover:border-[#D4AF37]/50 transition-all shadow-xl">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1C1F26]"></span>
                </button>

                {/* Action Button */}
                <button
                    onClick={onNewLead}
                    className="btn-gold flex items-center gap-2 shadow-xl shadow-black/30"
                >
                    <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="tracking-widest">Nouveau Prospect</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
