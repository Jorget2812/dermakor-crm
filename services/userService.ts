import { supabase } from '../utils/supabase';
import { User } from './commissions/types';

export const userService = {
    /**
     * Get all sellers and academy members for commission management
     */
    async getSellers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('role', ['vendeur', 'academy', 'sales_rep', 'collaborator', 'director', 'directeur'])
            .order('full_name', { ascending: true });

        if (error) throw error;

        return (data || []).map(p => ({
            id: p.id,
            fullName: p.full_name,
            role: p.role,
            commissionPercentage: p.commission_percentage || 20.00,
            isActive: true
        })) as User[];
    },

    /**
     * Update a user's personalized commission percentage
     */
    async updateCommissionPercentage(userId: string, percentage: number) {
        const { error } = await supabase
            .from('profiles')
            .update({ commission_percentage: percentage })
            .eq('id', userId);

        if (error) throw error;
    }
};
