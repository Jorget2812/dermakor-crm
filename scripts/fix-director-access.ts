import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixDirectorAccess() {
    const email = 'georgitorres2812@gmail.com';
    console.log(`🔍 Checking access for ${email}...`);

    // 1. Find User in Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('❌ Error listing users:', authError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`❌ User ${email} not found in Supabase Auth. Please sign up first.`);
        // Optional: Create the user if they don't exist? 
        // Usually better to let them sign up, but if they say "create a user", maybe they mean "I created it".
        return;
    }

    console.log(`✅ User found: ${user.id}`);

    // 2. Check/Update Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        console.log(`ℹ️ Profile exists. Current Role: ${profile.role}`);
    } else {
        console.log(`⚠️ No profile found. Creating one...`);
    }

    // 3. Force Update/Insert as Directeur
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Georgi Torres',
            role: 'directeur', // Force role
            avatar_url: user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString()
        });

    if (upsertError) {
        console.error('❌ Error updating profile:', upsertError);
    } else {
        console.log(`✅ SUCCESS! Profile for ${email} is now set to 'directeur'.`);
        console.log('👉 You should now be able to access the Commissions module.');
    }
}

fixDirectorAccess();
