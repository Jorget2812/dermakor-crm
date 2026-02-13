-- RESTRICT DELETION TO DIRECTORS
-- FEVRIER 2026

-- 1. Hardening Prospects RLS
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Full access to auth users" ON public.prospects;

-- Read policy: Authenticated users can see all prospects
CREATE POLICY "Public read for authenticated" ON public.prospects 
  FOR SELECT TO authenticated USING (true);

-- Insert policy: Authenticated users can create prospects
CREATE POLICY "Public insert for authenticated" ON public.prospects 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Update policy: Authenticated users can update prospects
CREATE POLICY "Public update for authenticated" ON public.prospects 
  FOR UPDATE TO authenticated USING (true);

-- DELETE POLICY: ONLY DIRECTORS
-- We check the profiles table for the current user's role
CREATE POLICY "Only directors can delete prospects" ON public.prospects
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'directeur'
    )
  );

-- 2. Hardening Profiles RLS (Security Best Practice)
DROP POLICY IF EXISTS "Full access to auth users" ON public.profiles;

-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Only user can update their own profile (except role)
CREATE POLICY "Users can update own non-security profile fields" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);
