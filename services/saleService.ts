import { supabase } from '../utils/supabase';

export interface Sale {
    id: string;
    prospect_id: string;
    seller_id: string;
    referral_code_id?: string;
    sale_amount: number;
    commission_percentage: number;
    commission_amount: number;
    tracking_method: 'link' | 'code' | 'manual' | 'direct';
    status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
    product_name?: string;
    order_number?: string;
    sale_date: string;
    payment_date?: string;
    notes?: string;
    created_by: string;
}

export const saleService = {
    /**
     * Create a new sale record
     */
    async createSale(sale: Partial<Sale>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Fetch seller's percentage if not provided
        let percentage = sale.commission_percentage;
        if (!percentage && sale.seller_id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('commission_percentage')
                .eq('id', sale.seller_id)
                .single();
            percentage = profile?.commission_percentage || 20.00;
        }

        const { data, error } = await supabase
            .from('sales')
            .insert({
                ...sale,
                commission_percentage: percentage,
                created_by: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data as Sale;
    },

    /**
     * Get sales for a specific prospect
     */
    async getSalesByProspect(prospectId: string) {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .eq('prospect_id', prospectId);

        if (error) throw error;
        return data as Sale[];
    }
};
