import React from 'react';
import { useAuth } from './AuthProvider';
import { User, Shield, Key, Bell, Database } from 'lucide-react';

const Settings: React.FC = () => {
    const { user, profile, role } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-executive-neutral-800">Paramètres</h2>
                <p className="text-executive-neutral-400 font-medium">Gestion de votre compte et préférences système</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white p-8 rounded-[40px] border border-executive-neutral-200 shadow-sm flex items-center gap-6">
                <div className="relative">
                    <img
                        src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || user?.email}&background=C0A76A&color=fff`}
                        className="w-24 h-24 rounded-full border-4 border-executive-neutral-100 shadow-inner"
                        alt="Avatar"
                    />
                     <div className="absolute bottom-0 right-0 bg-status-success w-6 h-6 rounded-full border-4 border-white"></div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-executive-neutral-900">{profile?.full_name || 'Utilisateur'}</h3>
                    <p className="text-executive-neutral-500 font-medium mb-2">{user?.email}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        role === 'directeur' 
                        ? 'bg-executive-gold-100 text-executive-gold-700' 
                        : 'bg-executive-neutral-100 text-executive-neutral-600'
                    }`}>
                        {role === 'directeur' ? 'Directeur Commercial' : role === 'vendeur' ? 'Vendeur Premium' : role}
                    </span>
                </div>
            </div>

            {/* Director Only Settings */}
            {role === 'directeur' && (
                <div className="bg-executive-neutral-800 text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-executive-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <Shield className="text-executive-gold-500" />
                        <h3 className="text-xl font-bold">Zone Administration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors flex items-center gap-4 group">
                            <div className="p-2 bg-executive-gold-500/20 rounded-lg text-executive-gold-500 group-hover:text-white group-hover:bg-executive-gold-500 transition-colors">
                                <Key size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Permissions & Rôles</p>
                                <p className="text-xs text-executive-neutral-400">Gérer les accès utilisateurs</p>
                            </div>
                        </button>

                         <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors flex items-center gap-4 group">
                            <div className="p-2 bg-executive-gold-500/20 rounded-lg text-executive-gold-500 group-hover:text-white group-hover:bg-executive-gold-500 transition-colors">
                                <Database size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Base de Données</p>
                                <p className="text-xs text-executive-neutral-400">Logs système et backups</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* General Settings */}
            <div className="bg-white p-8 rounded-[40px] border border-executive-neutral-200 shadow-sm">
                <h3 className="text-lg font-bold text-executive-neutral-800 mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-executive-neutral-400" /> Préférences
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-executive-neutral-50 rounded-2xl">
                        <div>
                            <p className="text-sm font-bold text-executive-neutral-800">Notifications Email</p>
                            <p className="text-xs text-executive-neutral-500">Recevoir un résumé hebdomadaire</p>
                        </div>
                        <div className="w-12 h-6 bg-executive-gold-500 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
