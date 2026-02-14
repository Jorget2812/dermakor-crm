import { supabase } from '../utils/supabase';

async function fixReferralRLS() {
    console.log('Fixing RLS for referral_codes...');

    const { error: dropError } = await supabase.rpc('exec_sql', {
        sql: `
            DROP POLICY IF EXISTS "Usuarios ven sus propios códigos" ON public.referral_codes;
            DROP POLICY IF EXISTS "Solo directores gestionan códigos" ON public.referral_codes;
            
            CREATE POLICY "Usuarios ven sus propios códigos"
            ON public.referral_codes FOR SELECT TO authenticated
            USING (user_id = auth.uid());

            CREATE POLICY "Usuarios pueden insertar sus propios códigos"
            ON public.referral_codes FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Directores gestionan todo en códigos"
            ON public.referral_codes FOR ALL TO authenticated
            USING (
              EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'director' OR profiles.role = 'directeur'))
            );
        `
    });

    if (dropError) {
        console.error('Error fixing RLS:', dropError);
    } else {
        console.log('RLS fixed successfully!');
    }
}

// Note: This script assumes 'exec_sql' RPC exists or that we can run raw SQL via some other means.
// If exec_sql doesn't exist, I'll provide the SQL separately for the user to run in Supabase.
// I'll also try a direct approach if possible.
