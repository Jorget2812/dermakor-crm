-- DERMAKOR CRM PREMIUM SCHEMA MIGRATION
-- FEVRIER 2026

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('directeur', 'vendeur', 'academy');
CREATE TYPE pipeline_stage AS ENUM ('nouveau', 'contacte', 'qualifie', 'proposition', 'negociation', 'ferme_gagne', 'ferme_perdu');
CREATE TYPE company_type AS ENUM ('institut', 'clinique', 'independant');
CREATE TYPE lead_source AS ENUM ('web', 'instagram', 'refere', 'evenement', 'autre');
CREATE TYPE potential_monthly AS ENUM ('moins_5k', '5k_10k', '10k_15k', '15k_25k', '25k_40k', 'plus_40k');
CREATE TYPE urgency_level AS ENUM ('basse', 'moyenne', 'haute', 'immediate');
CREATE TYPE availability_type AS ENUM ('startup', 'developp_1_2ans', 'etabli_2ans_plus', 'leader_marche');
CREATE TYPE investment_capacity AS ENUM ('moins_5k', '5k_10k', '10k_20k', '20k_50k', 'plus_50k');
CREATE TYPE price_sensitivity AS ENUM ('basse', 'moyenne', 'haute');

-- 3. TABLES

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role DEFAULT 'vendeur',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prospects (Upgraded leads)
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_type company_type NOT NULL,
  ide_number TEXT,
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  canton TEXT NOT NULL,
  
  contact_civility TEXT,
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_function TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_linkedin TEXT,
  
  source lead_source NOT NULL,
  assigned_to UUID REFERENCES auth.users,
  potential_monthly potential_monthly NOT NULL,
  maturity_level availability_type,
  urgency urgency_level,
  suggested_plan TEXT CHECK (suggested_plan IN ('standard', 'premium', 'indecis')),
  investment_capacity investment_capacity,
  price_sensitivity price_sensitivity,
  interest_academy BOOLEAN DEFAULT false,
  interest_exclusivity BOOLEAN DEFAULT false,
  
  lead_score INTEGER DEFAULT 0,
  is_premium_candidate BOOLEAN DEFAULT false,
  
  pipeline_stage pipeline_stage NOT NULL DEFAULT 'nouveau',
  pipeline_stage_entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  probability_close INTEGER DEFAULT 0,
  estimated_deal_value NUMERIC(10,2),
  expected_close_date DATE,
  
  is_closed BOOLEAN DEFAULT false,
  close_status TEXT CHECK (close_status IN ('gagne', 'perdu')),
  close_date DATE,
  final_deal_value NUMERIC(10,2),
  chosen_plan TEXT CHECK (chosen_plan IN ('standard', 'premium')),
  
  lost_reason TEXT,
  lost_competitor TEXT,
  lost_details TEXT,
  nurture_recontact_date DATE,
  
  objections TEXT[] DEFAULT '{}',
  strategic_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE
);

-- Activities
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users,
  type TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  duration_minutes INTEGER,
  email_template_used TEXT,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_id UUID UNIQUE REFERENCES prospects(id),
  partner_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  canton TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('standard', 'premium')),
  contract_signed_date DATE NOT NULL,
  has_exclusivity BOOLEAN DEFAULT false,
  academy_status TEXT DEFAULT 'non_initie',
  monthly_revenue_actual NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SCORING ENGINE (TRIGGER)
CREATE OR REPLACE FUNCTION calculate_lead_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Potential (30 pts)
  score := score + CASE NEW.potential_monthly
    WHEN 'plus_40k' THEN 30
    WHEN '25k_40k' THEN 25
    WHEN '15k_25k' THEN 20
    WHEN '10k_15k' THEN 15
    WHEN '5k_10k' THEN 10
    ELSE 5
  END;
  
  -- Type (20 pts)
  score := score + CASE NEW.company_type
    WHEN 'clinique' THEN 20
    WHEN 'institut' THEN 15
    WHEN 'independant' THEN 10
  END;
  
  -- Urgency (15 pts)
  score := score + CASE NEW.urgency
    WHEN 'immediate' THEN 15
    WHEN 'haute' THEN 12
    WHEN 'moyenne' THEN 8
    ELSE 4
  END;

  NEW.lead_score := score;
  NEW.is_premium_candidate := (score >= 60); -- Simple threshold for now
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_lead_score ON prospects;
CREATE TRIGGER trg_calculate_lead_score
  BEFORE INSERT OR UPDATE OF potential_monthly, company_type, urgency ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION calculate_lead_score();

-- 5. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Simple policies: All authenticated users can read/write everything for now
-- (Based on PRD, we'd add role-based isolation later)
CREATE POLICY "Full access to auth users" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Full access to auth users" ON public.prospects FOR ALL TO authenticated USING (true);
CREATE POLICY "Full access to auth users" ON public.activities FOR ALL TO authenticated USING (true);
CREATE POLICY "Full access to auth users" ON public.partners FOR ALL TO authenticated USING (true);
