import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
    console.log('--- SALES TABLE ---');
    const { data: sales, error: salesError } = await supabase.from('sales').select('*');
    if (salesError) console.error('Error fetching sales:', salesError);
    else console.log(`Found ${sales.length} sales.`, sales);

    console.log('--- PROFILES TABLE ---');
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
    if (profilesError) console.error('Error fetching profiles:', profilesError);
    else console.log(`Found ${profiles.length} profiles.`, profiles);

    console.log('--- COUNT BY ROLE ---');
    const roles = profiles?.reduce((acc: any, p) => {
        acc[p.role] = (acc[p.role] || 0) + 1;
        return acc;
    }, {});
    console.log(roles);
}

checkData();
