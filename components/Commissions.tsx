import React, { useState, useEffect } from 'react';
import { Prospect } from '../types';
import { useAuth } from './AuthProvider';
import { supabase } from '../utils/supabase';
import DirecteurCommissionsView from './commissions/DirecteurCommissionsView';
import VendeurCommissionsView from './commissions/VendeurCommissionsView';
import CommissionsSimulator from './commissions/CommissionsSimulator';
import { Calculator } from 'lucide-react';

interface CommissionsProps {
    leads: Prospect[];
}

const Commissions: React.FC<CommissionsProps> = ({ leads }) => {
    const { user } = useAuth();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSimulator, setShowSimulator] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserRole();
        }
    }, [user]);

    async function fetchUserRole() {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user?.id)
                .single();

            setRole(data?.role || 'vendeur'); // Default to vendeur if not found or null
        } catch (err) {
            console.error('Error fetching role:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-executive-gold-500" />
            </div>
        );
    }

    if (showSimulator) {
        return <CommissionsSimulator leads={leads} onBack={() => setShowSimulator(false)} />;
    }

    return (
        <div className="space-y-6">
            {/* Top Bar for Switching to Simulator */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowSimulator(true)}
                    className="flex items-center gap-2 text-sm font-bold text-executive-neutral-500 hover:text-executive-gold-600 transition-colors bg-white px-4 py-2 rounded-xl border border-executive-neutral-200 shadow-sm"
                >
                    <Calculator size={16} />
                    Accéder au Simulateur
                </button>
            </div>

            {role === 'directeur' ? (
                <DirecteurCommissionsView />
            ) : (
                <VendeurCommissionsView />
            )}
        </div>
    );
};

export default Commissions;
