import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    CheckCircle2,
    XCircle,
    UserPlus,
    Search,
    Building2,
    Mail,
    Phone,
    Clock,
    Filter,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PartnerUser {
    id: string;
    email: string;
    company_name: string;
    contact_name: string;
    phone: string;
    status: 'pending' | 'approved' | 'rejected' | 'active';
    created_at: string;
}

const PartnerApproval: React.FC = () => {
    const [partners, setPartners] = useState<PartnerUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('partner_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [statusFilter]);

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            const { error } = await supabase
                .from('partner_users')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setPartners(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado del partner');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredPartners = partners.filter(p =>
        p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="luxury-card p-10 h-[calc(100vh-220px)] overflow-y-auto shadow-2xl custom-scrollbar bg-[#0F1115]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                        <UserPlus className="text-[#D4AF37]" size={32} />
                        Approbations Partners
                    </h2>
                    <p className="text-[#9E9E96] text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                        Gestion des nouvelles demandes d'accès à l'Espace Partenaire.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B63]" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher un partner..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#1C1F26] border border-[#2D323B] rounded-xl pl-12 pr-6 py-3 text-[11px] text-white font-bold tracking-wider focus:outline-none focus:border-[#D4AF37] transition-all w-64 uppercase"
                        />
                    </div>

                    <div className="flex bg-[#1C1F26] border border-[#2D323B] rounded-xl p-1 gap-1">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                                        ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                                        : 'text-[#6B6B63] hover:text-white'
                                    }`}
                            >
                                {s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvés' : s === 'rejected' ? 'Refusés' : 'Tous'}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={fetchPartners}
                        className="p-3 bg-[#1C1F26] border border-[#2D323B] rounded-xl text-[#D4AF37] hover:bg-white/5 transition-all"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                        <RefreshCw size={48} className="animate-spin mb-4" />
                        <p className="font-black text-[10px] uppercase tracking-[0.4em]">Chargement des données...</p>
                    </div>
                ) : filteredPartners.length > 0 ? (
                    <AnimatePresence>
                        {filteredPartners.map((partner) => (
                            <motion.div
                                key={partner.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-[#1C1F26] border border-[#2D323B] rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all shadow-2xl overflow-hidden"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/2 rounded-2xl flex items-center justify-center border border-white/5 text-[#D4AF37] shadow-xl group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                            <Building2 size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black text-white tracking-tight group-hover:text-[#D4AF37] transition-colors uppercase">
                                                    {partner.company_name}
                                                </h3>
                                                {partner.status === 'pending' && (
                                                    <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-black px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 animate-pulse">
                                                        NOUVEAU
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-6 items-center">
                                                <div className="flex items-center gap-2 text-[#6B6B63] text-[10px] font-bold uppercase tracking-widest">
                                                    <UserPlus size={12} className="text-[#D4AF37]" />
                                                    {partner.contact_name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[#6B6B63] text-[10px] font-bold uppercase tracking-widest">
                                                    <Mail size={12} className="text-[#D4AF37]" />
                                                    {partner.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[#6B6B63] text-[10px] font-bold uppercase tracking-widest">
                                                    <Phone size={12} className="text-[#D4AF37]" />
                                                    {partner.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-[#6B6B63] text-[10px] font-bold uppercase tracking-widest">
                                                    <Clock size={12} className="text-[#D4AF37]" />
                                                    {new Date(partner.created_at).toLocaleDateString('fr-CH')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full lg:w-auto">
                                        {partner.status === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(partner.id, 'rejected')}
                                                    disabled={processingId === partner.id}
                                                    className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                >
                                                    <XCircle size={14} />
                                                    Rejeter
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(partner.id, 'approved')}
                                                    disabled={processingId === partner.id}
                                                    className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-3 bg-[#D4AF37] text-black hover:bg-[#B08D55] rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    {processingId === partner.id ? 'Traitement...' : 'Approuver'}
                                                </button>
                                            </>
                                        ) : (
                                            <div className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${partner.status === 'approved'
                                                    ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                }`}>
                                                {partner.status === 'approved' ? 'APPROUVÉ' : 'REFUSÉ'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-32 bg-white/2 rounded-3xl border-2 border-dashed border-white/5 grayscale">
                        <UserPlus size={56} className="mx-auto mb-6 opacity-10" />
                        <p className="text-[#6B6B63] font-black uppercase tracking-[0.3em]">Aucune demande en attente</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerApproval;
