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
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pipeline', icon: Target, label: 'Pipeline' },
    { id: 'performance', icon: TrendingUp, label: 'Performance' },
    { id: 'commissions', icon: DollarSign, label: 'Commissions' },
    { id: 'academy', icon: GraduationCap, label: 'Academy' },
    { id: 'map', icon: Map, label: 'Carte Suisse' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false); // Cierra el sidebar en móvil al seleccionar
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
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all group ${
                activeTab === item.id
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

        {/* Footer */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[8px] text-[#6B6B63] font-black uppercase tracking-[0.3em] text-center">
            Excellence 2025
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;