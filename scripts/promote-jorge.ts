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

async function promoteToDirector() {
    const email = 'torresjorge2812@gmail.com';
    const newPassword = '1718473968';
    const fullName = 'Jorge Torres';

    console.log(`🚀 Promoting ${email} to Director...`);

    // 1. Find User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error(`User ${email} not found.`);
        return;
    }

    // 2. Update Auth (Password)
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
            password: newPassword,
            user_metadata: { full_name: fullName }
        }
    );

    if (authUpdateError) {
        console.error('Error updating auth:', authUpdateError);
        return;
    }
    console.log('✅ Auth password and metadata updated.');

    // 3. Update Profile (Role)
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: fullName,
            role: 'director',
            updated_at: new Date().toISOString()
        });

    if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
    }
    console.log(`✅ SUCCESS! ${fullName} is now a Director.`);
}

promoteToDirector();
