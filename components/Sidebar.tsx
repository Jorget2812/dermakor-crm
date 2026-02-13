import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  MapPin,
  GraduationCap,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '../utils/supabase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface UserProfile {
  full_name: string;
  avatar_url: string | null;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user?.id)
      .single();

    if (data) setProfile(data);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'pipeline', label: "L'Écosystème Partenaires", icon: Zap },
    { id: 'map', label: 'Carte Cantonale', icon: MapPin },
    { id: 'academy', label: 'Académie', icon: GraduationCap },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
  ];

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      directeur: 'Directeur Commercial',
      vendeur: 'Vendeur Premium',
      academy: 'Responsable Académie'
    };
    return labels[role] || 'Utilisateur';
  };

  return (
    <div className="w-[240px] glass-sidebar h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl shadow-black/50">
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
            <span className="text-black font-black text-xl">D</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wider leading-none uppercase">DermaKor</h1>
            <p className="text-[#D4AF37] text-[10px] uppercase font-black tracking-[0.3em] mt-1.5 opacity-80">Swiss Sàrl</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === item.id
              ? 'bg-[#D4AF37] text-black shadow-xl shadow-[#D4AF37]/10 scale-[1.02]'
              : 'text-[#9E9E96] hover:bg-white/5 hover:text-white'
              }`}
          >
            <item.icon size={18} className={activeTab === item.id ? 'text-black' : 'text-[#6B6B63] group-hover:text-[#D4AF37] transition-colors'} />
            <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === item.id ? 'font-black' : ''}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        <div className="bg-[#1C1F26] rounded-2xl p-4 border border-[#2D323B]">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user?.email}&background=D4AF37&color=000`}
                className="w-10 h-10 rounded-full border-2 border-[#2D323B]"
                alt="Avatar"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#1C1F26]"></div>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-xs font-black truncate uppercase tracking-tight">
                {profile?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[#D4AF37] text-[9px] font-black uppercase tracking-widest truncate mt-0.5 opacity-70">
                {profile ? getRoleLabel(profile.role) : 'Consultant'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center justify-center gap-2 p-2 rounded-xl text-[#9E9E96] bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              <Settings size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Config</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-2 p-2 rounded-xl text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all border border-red-500/5"
            >
              <LogOut size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Sortir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
