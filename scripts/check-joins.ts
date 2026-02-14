import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkJoins() {
    console.log('--- TESTING JOIN: sales -> profiles ---');
    const { data, error } = await supabase
        .from('sales')
        .select(`
            id,
            seller_id,
            seller:seller_id (id, full_name, role)
        `)
        .limit(5);

    if (error) {
        console.error('Error with join:', error);
    } else {
        console.log('Join Result:', JSON.stringify(data, null, 2));
    }

    console.log('--- TESTING JOIN: sales -> prospects ---');
    const { data: pData, error: pError } = await supabase
        .from('sales')
        .select(`
            id,
            prospect_id,
            prospect:prospect_id (company_name)
        `)
        .limit(5);

    if (pError) {
        console.error('Error with prospect join:', pError);
    } else {
        console.log('Prospect Join Result:', JSON.stringify(pData, null, 2));
    }
}

checkJoins();
