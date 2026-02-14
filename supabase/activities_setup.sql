-- ACTIVITIES TABLE SETUP
-- FEVRIER 2026

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('call', 'email', 'demo', 'task', 'reminder')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  priority VARCHAR(20) CHECK (priority IN ('urgent', 'high', 'normal', 'low')) DEFAULT 'normal',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_activities_prospect ON activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON activities(scheduled_date) WHERE completed = false;
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by);

-- RLS Policies
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Note: Using standard authenticated access. 
-- You can harden these to check for specific roles or ownership if needed.

CREATE POLICY "Usuarios pueden ver sus actividades"
ON public.activities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios pueden crear actividades"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar actividades"
ON public.activities FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios pueden eliminar actividades"
ON public.activities FOR DELETE
TO authenticated
USING (true);
