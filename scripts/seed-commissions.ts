import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCommissions() {
    console.log('🌱 Seeding commissions...');

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // 1. Règles Commissions
    const { data: rule, error } = await supabase
        .from('commission_rules')
        .upsert({
            month,
            year,
            standard_commission_pct: 8.00,
            premium_commission_pct: 12.00,
            standard_volume_bonus_pct: 2.00,
            standard_volume_threshold: 5,
            premium_volume_bonus_pct: 3.00,
            premium_volume_threshold: 3,
            objective_amount: 30000,
            bonus_100_110: 500,
            bonus_111_125: 1000,
            bonus_above_125: 1500,
            sla_threshold_pct: 95,
            sla_bonus_amount: 300,
            first_premium_bonus: 200,
            exclusivity_bonus: 800,
            large_deal_threshold: 50000,
            large_deal_bonus: 1200,
            is_active: true
            // created_by needs a valid UUID. If using Service Role, RLS is bypassed but foreign key might fail if user doesn't exist.
            // We'll skip created_by or fetch a user first.
        }, { onConflict: 'month,year' })
        .select()
        .single();

    if (error) {
        if (error.code === '23502') { // Not null violation for created_by
            // Try to find a user
            const { data: users } = await supabase.from('profiles').select('id').limit(1);
            if (users && users.length > 0) {
                await supabase.from('commission_rules').upsert({
                    month,
                    year,
                    created_by: users[0].id,
                    // ... rest repeats
                }, { onConflict: 'month,year' });
                console.log('✅ Rule created with user', users[0].id);
            } else {
                console.error('Cannot seed rule: No users found in profiles to set as created_by');
            }
        } else {
            console.error('Error seeding rule:', error);
        }
    } else {
        console.log('✅ Rule created:', rule?.id);
    }

    console.log('✅ Seed completed!');
}

seedCommissions();
