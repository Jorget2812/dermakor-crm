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

async function createTestSellers() {
    console.log('🚀 Creating 4 Test Sellers...');

    const sellers = [
        { email: 'seller.alpha@dermakor.test', first: 'Seller', last: 'Alpha', rate: 15.0 },
        { email: 'seller.beta@dermakor.test', first: 'Seller', last: 'Beta', rate: 22.5 },
        { email: 'seller.gamma@dermakor.test', first: 'Seller', last: 'Gamma', rate: 25.0 },
        { email: 'seller.delta@dermakor.test', first: 'Seller', last: 'Delta', rate: 30.0 }
    ];

    for (const s of sellers) {
        console.log(`Creating ${s.first} ${s.last}...`);

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: s.email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: `${s.first} ${s.last}` }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`User ${s.email} already exists, updating profile...`);
                // Find existing user
                const { data: existingUser } = await supabase.from('profiles').select('id').eq('first_name', s.first).eq('last_name', s.last).limit(1);
                if (existingUser && existingUser.length > 0) {
                    await supabase.from('profiles').update({ commission_percentage: s.rate, role: 'vendeur' }).eq('id', existingUser[0].id);
                    console.log(`✅ ${s.first} updated to ${s.rate}%`);
                    continue;
                }
            } else {
                console.error(`Error creating ${s.email}:`, authError.message);
                continue;
            }
        }

        const userId = authData.user?.id;
        if (!userId) continue;

        // 2. Create/Update Profile
        // Note: The system might have a trigger, so we'll UPSERT to be safe
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                first_name: s.first,
                last_name: s.last,
                role: 'vendeur',
                commission_percentage: s.rate,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (profileError) {
            console.error(`Error profile ${s.email}:`, profileError.message);
        } else {
            console.log(`✅ ${s.first} created/updated with ${s.rate}%`);
        }
    }

    console.log('\n✨ All sellers ready! Password: password123');
}

createTestSellers();
