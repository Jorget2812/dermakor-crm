import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Map,
  Settings,
  Menu,
  X,
  LogOut,
  CheckCircle2,
  User,
  UserPlus
} from 'lucide-react';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile, role, signOut, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { id: 'pipeline', icon: Target, label: 'Pipeline Stratégique' },
    { id: 'performance', icon: TrendingUp, label: 'Performance Analytics' },
    { id: 'commissions', icon: DollarSign, label: 'Commissions' },
    { id: 'academy', icon: GraduationCap, label: 'DermaKor Academy' },
    { id: 'approval', icon: UserPlus, label: 'Approbation Partners' },
    { id: 'map', icon: Map, label: 'Vue Territoriale' },
    { id: 'settings', icon: Settings, label: 'Configuration' },
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <>
      {/* Hamburger Button - Solo visible en móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-[#1C1F26] border border-[#2D323B] rounded-xl shadow-2xl hover:border-[#D4AF37] transition-all"
      >
        {isOpen ? (
          <X size={24} className="text-[#D4AF37]" />
        ) : (
          <Menu size={24} className="text-[#D4AF37]" />
        )}
      </button>

      {/* Overlay - Solo visible cuando el sidebar está abierto en móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xl z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[240px] 
          bg-[#0F1115] border-r border-[#2D323B] 
          flex flex-col py-10 px-6 z-[56]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="mb-16">
          <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#A68F54] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20 mb-4">
            <span className="text-black font-black text-2xl">D</span>
          </div>
          <h1 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-1">DermaKor</h1>
          <p className="text-[8px] text-[#6B6B63] font-black uppercase tracking-[0.3em]">Swiss CRM</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all group ${activeTab === item.id
                ? 'bg-[#D4AF37] text-black shadow-2xl shadow-[#D4AF37]/20'
                : 'text-[#9E9E96] hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon
                size={18}
                className={activeTab === item.id ? 'text-black' : 'group-hover:text-[#D4AF37] transition-colors'}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black text-[#6B6B63] uppercase tracking-[0.2em]">
              BIENVENUE, {(role === 'directeur' || role === 'director') ? 'RESP.' : 'COLLAB.'}
            </p>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#1C1F26] border border-[#2D323B] flex items-center justify-center text-[#D4AF37] font-black text-xs shadow-xl ring-1 ring-[#D4AF37]/10">
                {profile?.full_name ? getInitials(profile.full_name) : <User size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-black text-white truncate uppercase tracking-tight">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={10} className="text-[#D4AF37]" />
                  <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest whitespace-nowrap">
                    {(role === 'directeur' || role === 'director') ? 'Responsable' : 'Collaboreur'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-2">
              <span className="text-[9px] font-black text-[#6B6B63] hover:text-white cursor-pointer transition-colors">FR</span>
              <span className="text-[9px] font-black text-[#6B6B63] hover:text-white cursor-pointer transition-colors">DE</span>
              <span className="text-[9px] font-black text-[#6B6B63] hover:text-white cursor-pointer transition-colors">IT</span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-[#6B6B63] hover:text-[#EF4444] transition-all hover:scale-110"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;