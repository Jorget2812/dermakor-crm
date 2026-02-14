-- TABLAS DE COMISIONES Y VENTAS
-- Actualizado: Soporte para porcentaje personalizado por usuario

-- 1. Actualizar perfiles con campo de comisión personalizado
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,2) DEFAULT 20.00;

-- 2. Tabla de códigos de referido únicos por vendedor
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  link TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_code UNIQUE(user_id)
);

-- 3. Tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  referral_code_id UUID REFERENCES referral_codes(id),
  
  sale_amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL, -- Se guarda el porcentaje al momento de la venta
  commission_amount DECIMAL(10,2) GENERATED ALWAYS AS (sale_amount * commission_percentage / 100) STORED,
  
  tracking_method VARCHAR(20) CHECK (tracking_method IN ('link', 'code', 'manual', 'direct')) DEFAULT 'manual',
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')) DEFAULT 'pending',
  
  product_name VARCHAR(200),
  order_number VARCHAR(100),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_date DATE,
  
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de pagos de comisiones
CREATE TABLE IF NOT EXISTS public.commission_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales DECIMAL(10,2) NOT NULL,
  total_commission DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  payment_date DATE,
  payment_method VARCHAR(50),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_commission_payments_seller ON commission_payments(seller_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);

-- RLS Policies
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_payments ENABLE ROW LEVEL SECURITY;

-- Ventas
CREATE POLICY "Vendedores ven sus propias ventas"
ON public.sales FOR SELECT TO authenticated
USING (seller_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Solo directores pueden gestionar ventas"
ON public.sales FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'director' OR profiles.role = 'directeur'))
);

-- Códigos
CREATE POLICY "Usuarios ven sus propios códigos"
ON public.referral_codes FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Solo directores gestionan códigos"
ON public.referral_codes FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'director' OR profiles.role = 'directeur'))
);

-- Pagos
CREATE POLICY "Vendedores ven sus propios pagos"
ON public.commission_payments FOR SELECT TO authenticated
USING (seller_id = auth.uid());

CREATE POLICY "Solo directores gestionan pagos"
ON public.commission_payments FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'director' OR profiles.role = 'directeur'))
);

-- Función para generar código único
CREATE OR REPLACE FUNCTION generate_referral_code(user_full_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  base_code := UPPER(
    SUBSTRING(SPLIT_PART(user_full_name, ' ', 1), 1, 1) || 
    SUBSTRING(SPLIT_PART(user_full_name, ' ', 2), 1, 1) || 
    EXTRACT(YEAR FROM NOW())::TEXT
  );
  final_code := base_code;
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;
