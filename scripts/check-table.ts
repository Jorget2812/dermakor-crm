import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function checkStructure() {
    const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'prospects' });

    if (error) {
        // If RPC doesn't exist, try a simple query
        console.log('RPC get_table_columns failed, trying alternative...');
        const { data: cols, error: err2 } = await supabase.from('prospects').select('*').limit(1);
        if (err2) {
            console.error('Error fetching prospects:', err2);
        } else {
            console.log('Columns found:', Object.keys(cols[0] || {}));
        }
    } else {
        console.log('Table columns:', data);
    }
}

checkStructure();
