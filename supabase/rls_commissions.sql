-- Enable RLS
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_commission_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour commission_rules
-- Directeur: Full access
CREATE POLICY "Directeur full access commission_rules"
ON commission_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'directeur'
  )
);

-- Vendeur: Read only (Cannot modify rules)
CREATE POLICY "Vendeur read commission_rules"
ON commission_rules
FOR SELECT
USING (true);

-- Policies pour commission_payouts
-- Directeur: Full access
CREATE POLICY "Directeur full access payouts"
ON commission_payouts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'directeur'
  )
);

-- Vendeur: Read own payouts only
CREATE POLICY "Vendeur read own payouts"
ON commission_payouts
FOR SELECT
USING (vendeur_id = auth.uid());

-- Policies pour deal_commission_details
-- Directeur: Full access
CREATE POLICY "Directeur full access deal_details"
ON deal_commission_details
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'directeur'
  )
);

-- Vendeur: Read own deal details via payout association
CREATE POLICY "Vendeur read own deal_details"
ON deal_commission_details
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM commission_payouts
    WHERE commission_payouts.id = deal_commission_details.payout_id
    AND commission_payouts.vendeur_id = auth.uid()
  )
);

-- Policies pour audit_logs
-- Directeur: Read all
CREATE POLICY "Directeur read audit_logs"
ON audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'directeur'
  )
);

-- Users can create audit logs
CREATE POLICY "Users can create audit logs"
ON audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);
