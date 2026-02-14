import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyFinal() {
    console.log('--- VERIFYING SALES DATA (DIRECTOR VIEW) ---');
    const { data: salesData } = await supabase.from('sales').select('id, seller_id, prospect_id');

    if (!salesData || salesData.length === 0) {
        console.log('No sales found.');
        return;
    }

    const sellerIds = Array.from(new Set(salesData.map(s => s.seller_id)));
    const { data: profileData } = await supabase.from('profiles').select('id, full_name').in('id', sellerIds);

    console.log(`Found ${salesData.length} sales across ${sellerIds.length} sellers.`);
    profileData?.forEach(p => {
        const count = salesData.filter(s => s.seller_id === p.id).length;
        console.log(`- Seller: ${p.full_name} (${count} sales)`);
    });

    console.log('\n--- VERIFYING MTD CALCULATION ---');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const { data: mtdSales } = await supabase.from('sales')
        .select('sale_amount')
        .gte('sale_date', startOfMonth);

    const totalMTD = mtdSales?.reduce((sum, s) => sum + Number(s.sale_amount), 0) || 0;
    console.log(`CA Fermé MTD: CHF ${totalMTD.toLocaleString()}`);
}

verifyFinal();
