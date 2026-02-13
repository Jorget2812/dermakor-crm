import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const sql = `
    SELECT 
        conname AS constraint_name, 
        pg_get_constraintdef(c.oid) AS constraint_definition
    FROM pg_constraint c 
    JOIN pg_namespace n ON n.oid = c.connamespace 
    WHERE n.nspname = 'public' 
    AND conrelid = 'prospects'::regclass;
  `;

    const { data, error } = await supabase.rpc('run_sql', { sql });
    if (error) {
        console.error('Error executing SQL:', error);
    } else {
        console.log('Constraints on prospects table:');
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
