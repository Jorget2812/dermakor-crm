-- Add new columns to leads table for enhanced contact information and appointment tracking

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_channel TEXT CHECK (contact_channel IN ('Email', 'WhatsApp', 'Instagram', 'Téléphone', 'LinkedIn'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS appointment_type TEXT CHECK (appointment_type IN ('Appel', 'Démo', 'Signature', 'Formation'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_meeting_notes TEXT;

-- Create index for appointment date queries
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON public.leads(follow_up_date) WHERE follow_up_date IS NOT NULL;

-- Success message
SELECT 'New columns added successfully to leads table' AS status;
