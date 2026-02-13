-- Create Tables for Commissions Module
-- Use raw SQL to avoid Prisma Introspection issues with existing DB state

CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  standard_commission_pct DECIMAL(5,2) DEFAULT 8.00,
  standard_volume_bonus_pct DECIMAL(5,2) DEFAULT 2.00,
  standard_volume_threshold INTEGER DEFAULT 5,
  premium_commission_pct DECIMAL(5,2) DEFAULT 12.00,
  premium_volume_bonus_pct DECIMAL(5,2) DEFAULT 3.00,
  premium_volume_threshold INTEGER DEFAULT 3,
  objective_amount DECIMAL(10,2) DEFAULT 30000,
  bonus_100_110 DECIMAL(10,2) DEFAULT 500,
  bonus_111_125 DECIMAL(10,2) DEFAULT 1000,
  bonus_above_125 DECIMAL(10,2) DEFAULT 1500,
  sla_threshold_pct INTEGER DEFAULT 95,
  sla_bonus_amount DECIMAL(10,2) DEFAULT 300,
  first_premium_bonus DECIMAL(10,2) DEFAULT 200,
  exclusivity_bonus DECIMAL(10,2) DEFAULT 800,
  large_deal_threshold DECIMAL(10,2) DEFAULT 50000,
  large_deal_bonus DECIMAL(10,2) DEFAULT 1200,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, year)
);

CREATE TABLE IF NOT EXISTS commission_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  rule_id UUID REFERENCES commission_rules(id),
  total_revenue_closed DECIMAL(10,2) DEFAULT 0,
  nb_deals_standard INTEGER DEFAULT 0,
  nb_deals_premium INTEGER DEFAULT 0,
  commission_standard DECIMAL(10,2) DEFAULT 0,
  commission_premium DECIMAL(10,2) DEFAULT 0,
  bonus_volume DECIMAL(10,2) DEFAULT 0,
  bonus_objective DECIMAL(10,2) DEFAULT 0,
  bonus_sla DECIMAL(10,2) DEFAULT 0,
  bonus_special DECIMAL(10,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'en_calcul',
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vendeur_id, month, year)
);

CREATE TABLE IF NOT EXISTS deal_commission_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID REFERENCES commission_payouts(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL,
  deal_number TEXT,
  deal_value DECIMAL(10,2),
  deal_plan TEXT,
  close_date TIMESTAMPTZ,
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
