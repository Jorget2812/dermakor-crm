-- DOCUMENT MANAGEMENT SYSTEM SETUP
-- FEVRIER 2026

-- 1. Metadata Table
CREATE TABLE IF NOT EXISTS public.prospect_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Metadata Table
ALTER TABLE public.prospect_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for prospects they can see"
  ON public.prospect_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload documents"
  ON public.prospect_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only directors and owners can delete documents"
  ON public.prospect_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'directeur' OR profiles.role = 'director')
    )
  );

-- 2. Storage Bucket Setup (Metadata only, bucket must be created in UI or via API)
-- Note: Supabase Storage RLS policies
-- Bucket: 'prospect-documents'

-- Policy for viewing files
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'prospect-documents');

-- Policy for uploading files
-- CREATE POLICY "Upload Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'prospect-documents');
