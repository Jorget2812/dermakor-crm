import { supabase } from '../utils/supabase';
import { ReferralCode, Sale, CommissionPayment, User } from './commissions/types';

export const salesService = {
    /**
     * Referral Code Logic: Get or generate a unique code for the user
     */
    async getOrCreateReferralCode(userId: string, fullName: string): Promise<ReferralCode> {
        // 1. Try to find existing
        const { data: existing, error: fetchError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (existing) return {
            id: existing.id,
            userId: existing.user_id,
            code: existing.code,
            link: existing.link,
            clicks: existing.clicks,
            conversions: existing.conversions,
            createdAt: existing.created_at
        };

        // 2. Ensure we have a descriptive name for the RPC
        let nameToUse = fullName;
        if (!nameToUse || nameToUse === 'Vendedor') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();
            if (profile?.full_name) nameToUse = profile.full_name;
        }

        // 3. If not found, generate using the RPC function
        const { data: generatedCode, error: rpcError } = await supabase.rpc('generate_referral_code', { user_full_name: nameToUse });

        const code = generatedCode || (nameToUse.substring(0, 2).toUpperCase() + new Date().getFullYear() + Math.floor(Math.random() * 100));
        const link = `https://krx.ch/?ref=${code}`;

        const { data: nuevo, error: insertError } = await supabase
            .from('referral_codes')
            .insert({
                user_id: userId,
                code: code,
                link: link
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting referral code:', insertError);
            throw insertError;
        }

        return {
            id: nuevo.id,
            userId: nuevo.user_id,
            code: nuevo.code,
            link: nuevo.link,
            clicks: nuevo.clicks,
            conversions: nuevo.conversions,
            createdAt: nuevo.created_at
        };
    },

    /**
     * Sales Logic: Get sales for the current seller
     */
    async getUserSales(userId: string): Promise<Sale[]> {
        const { data, error } = await supabase
            .from('sales')
            .select(`
                *,
                prospect:prospect_id (company_name)
            `)
            .eq('seller_id', userId)
            .order('sale_date', { ascending: false });

        if (error) throw error;

        return (data || []).map(s => ({
            ...s,
            id: s.id,
            prospectId: s.prospect_id,
            sellerId: s.seller_id,
            referralCodeId: s.referral_code_id,
            saleAmount: s.sale_amount,
            commissionPercentage: s.commission_percentage,
            commissionAmount: s.commission_amount,
            trackingMethod: s.tracking_method,
            status: s.status,
            productName: s.product_name,
            orderNumber: s.order_number,
            saleDate: s.sale_date,
            createdBy: s.created_by,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            prospect: s.prospect
        })) as Sale[];
    },

    /**
     * Sales Logic: Get ALL sales (Director only)
     */
    async getAllSales(): Promise<Sale[]> {
        // 1. Fetch sales
        const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select(`
                *,
                prospect:prospect_id (company_name)
            `)
            .order('sale_date', { ascending: false });

        if (salesError) throw salesError;
        if (!salesData || salesData.length === 0) return [];

        // 2. Fetch all seller profiles involved
        const sellerIds = Array.from(new Set(salesData.map(s => s.seller_id).filter(Boolean)));
        let profilesMap: Record<string, any> = {};

        if (sellerIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', sellerIds);

            if (profilesData) {
                profilesData.forEach(p => {
                    profilesMap[p.id] = p;
                });
            }
        }

        // 3. Manual Join and Mapping
        return salesData.map(s => {
            const sellerProfile = profilesMap[s.seller_id];
            return {
                ...s,
                id: s.id,
                prospectId: s.prospect_id,
                sellerId: s.seller_id,
                referralCodeId: s.referral_code_id,
                saleAmount: s.sale_amount,
                commissionPercentage: s.commission_percentage,
                commissionAmount: s.commission_amount,
                trackingMethod: s.tracking_method,
                status: s.status,
                productName: s.product_name,
                orderNumber: s.order_number,
                saleDate: s.sale_date,
                createdBy: s.created_by,
                createdAt: s.created_at,
                updatedAt: s.updated_at,
                seller: sellerProfile ? {
                    id: sellerProfile.id,
                    fullName: sellerProfile.full_name,
                    role: sellerProfile.role
                } : undefined,
                prospect: s.prospect
            };
        }) as any[];
    },

    /**
     * Create a new sale record
     */
    async createSale(saleData: Partial<Sale>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('sales')
            .insert([{
                prospect_id: saleData.prospectId,
                seller_id: saleData.sellerId,
                referral_code_id: saleData.referralCodeId,
                sale_amount: saleData.saleAmount,
                commission_percentage: saleData.commissionPercentage,
                tracking_method: saleData.trackingMethod || 'manual',
                status: saleData.status || 'pending',
                product_name: saleData.productName,
                order_number: saleData.orderNumber,
                sale_date: saleData.saleDate || new Date().toISOString().split('T')[0],
                notes: saleData.notes,
                created_by: user.id
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update sale status (Director only)
     */
    async updateSaleStatus(saleId: string, status: Sale['status']) {
        const { error } = await supabase
            .from('sales')
            .update({ status })
            .eq('id', saleId);

        if (error) throw error;
    },

    /**
     * Get statistics for a user or global
     */
    async getMonthlyStats(userId?: string) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        let query = supabase.from('sales')
            .select('sale_amount, commission_amount')
            .gte('sale_date', firstDay)
            .lte('sale_date', lastDay);

        if (userId) {
            query = query.eq('seller_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const totalVentas = data.reduce((sum, s) => sum + Number(s.sale_amount), 0);
        const comisionTotal = data.reduce((sum, s) => sum + Number(s.commission_amount), 0);
        const numVentas = data.length;
        const promedioVenta = numVentas > 0 ? totalVentas / numVentas : 0;

        return {
            totalVentas,
            comisionTotal,
            numVentas,
            promedioVenta
        };
    },

    /**
     * Get statistics for a user or global (All time)
     */
    async getSalesStats(userId?: string) {
        let query = supabase.from('sales').select('status, sale_amount, commission_amount');

        if (userId) {
            query = query.eq('seller_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const stats = {
            totalVentas: 0,
            comisionTotal: 0,
            confirmadas: 0,
            pendientes: 0,
            pagadas: 0
        };

        data.forEach(s => {
            stats.totalVentas += Number(s.sale_amount);
            stats.comisionTotal += Number(s.commission_amount);

            if (s.status === 'confirmed') stats.confirmadas += Number(s.commission_amount);
            if (s.status === 'pending') stats.pendientes += Number(s.commission_amount);
            if (s.status === 'paid') stats.pagadas += Number(s.commission_amount);
        });

        return stats;
    },

    /**
     * Process a commission payment
     */
    async processCommissionPayment(paymentData: Partial<CommissionPayment>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 1. Create the payment record
        const { data: payment, error: pError } = await supabase
            .from('commission_payments')
            .insert({
                seller_id: paymentData.sellerId,
                period_start: paymentData.periodStart,
                period_end: paymentData.periodEnd,
                total_sales: paymentData.totalSales,
                total_commission: paymentData.totalCommission,
                status: 'paid',
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: paymentData.paymentMethod,
                notes: paymentData.notes,
                created_by: user.id
            })
            .select()
            .single();

        if (pError) throw pError;

        // 2. Mark associated sales as paid
        const { error: sError } = await supabase
            .from('sales')
            .update({ status: 'paid' })
            .eq('seller_id', paymentData.sellerId)
            .eq('status', 'confirmed')
            .gte('sale_date', paymentData.periodStart)
            .lte('sale_date', paymentData.periodEnd);

        if (sError) throw sError;
    },

    /**
     * Update individual commission rate
     */
    async updateUserCommissionRate(userId: string, percentage: number) {
        const { error } = await supabase
            .from('profiles')
            .update({ commission_percentage: percentage })
            .eq('id', userId);

        if (error) throw error;
    }
};
