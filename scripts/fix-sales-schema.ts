import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchema() {
    console.log('--- FIXING SALES TABLE SCHEMA ---');

    // Since we cannot run ALTER TABLE directly via simple RPC without a custom function,
    // we will check if we can at least verify the current state and then use what we have.
    // However, for the user, the best way to fix this is to provide the SQL they need to run in their Supabase SQL editor
    // OR try to apply it if they have an 'exec_sql' RPC (rare).

    console.log('Note: This script verifies the need for the fix. The fix itself should be applied in Supabase SQL Editor.');

    const { data: sales, error } = await supabase
        .from('sales')
        .select(`
            id,
            seller_id,
            seller:seller_id (full_name)
        `)
        .limit(1);

    if (error && error.message.includes('relationship')) {
        console.log('❌ Verified: Relationship between sales and profiles is missing or incorrect.');
        console.log('SQL to run in Supabase SQL Editor:');
        console.log(`
            -- Fix relationships in sales table
            ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_seller_id_fkey;
            ALTER TABLE public.sales ADD CONSTRAINT sales_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id);
            
            ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_created_by_fkey;
            ALTER TABLE public.sales ADD CONSTRAINT sales_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
        `);
    } else {
        console.log('✅ Relationship seems to work or error is different:', error);
    }
}

fixSchema();
