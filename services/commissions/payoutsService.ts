import { supabase } from '../../utils/supabase';
import { CommissionPayout, DealCommissionDetail } from './types';

export const payoutsService = {
    async getPayoutsForMonth(month: number, year: number) {
        const { data, error } = await supabase
            .from('commission_payouts')
            .select(`
        *,
        vendeur:vendeur_id (
          full_name,
          role
        )
      `)
            .eq('month', month)
            .eq('year', year)
            .order('total_commission', { ascending: false });

        if (error) throw error;

        // Map response to internal types
        return (data || []).map((p: any) => ({
            ...p,
            vendeur: {
                id: p.vendeur_id,
                fullName: p.vendeur?.full_name || 'Unknown',
                role: p.vendeur?.role,
                isActive: true // Assuming active if payout exists
            }
        }));
    },

    async getMyPayouts(userId: string) {
        const { data, error } = await supabase
            .from('commission_payouts')
            .select('*')
            .eq('vendeur_id', userId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (error) throw error;
        return data as CommissionPayout[];
    },

    async getPayoutDetails(payoutId: string) {
        const { data, error } = await supabase
            .from('deal_commission_details')
            .select(`
        *,
        prospect:prospect_id (
          company_name
        )
      `)
            .eq('payout_id', payoutId);

        if (error) throw error;
        return data as (DealCommissionDetail & { prospect?: { companyName: string } })[];
    },

    async validatePayout(payoutId: string) {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('commission_payouts')
            .update({
                status: 'valide',
                validated_by: user?.id,
                validated_at: new Date().toISOString()
            })
            .eq('id', payoutId);

        if (error) throw error;
    },

    async validateAllPayouts(month: number, year: number) {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('commission_payouts')
            .update({
                status: 'valide',
                validated_by: user?.id,
                validated_at: new Date().toISOString()
            })
            .eq('month', month)
            .eq('year', year)
            .eq('status', 'en_validation'); // Only validate those ready for validation, or include en_calcul?
        // Assuming en_calcul -> en_validation manually first? 
        // Or direct validation from calculated. Let's allowing validating 'en_calcul' too.
        // .in('status', ['en_calcul', 'en_validation'])

        if (error) throw error;
    }
};
