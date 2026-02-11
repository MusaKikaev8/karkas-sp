-- Create table for custom formula blocks
CREATE TABLE IF NOT EXISTS custom_formula_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sp_code TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Formula definition
  title TEXT NOT NULL,
  description TEXT,
  latex TEXT NOT NULL,
  
  -- Parameters and calculation
  params JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- params structure: [{ name: string, label: string, unit?: string, min?: number, max?: number }]
  
  expression TEXT NOT NULL,
  -- JavaScript expression like "values.N / values.A" or "Math.sqrt(values.x * values.y)"
  -- Safe execution via new Function() with limited scope
  
  result_unit TEXT,
  result_label TEXT NOT NULL DEFAULT 'Результат',
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_title CHECK (title ~ '^\s*\S.*\S\s*$'),
  CONSTRAINT valid_latex CHECK (latex ~ '\\.*'),
  CONSTRAINT valid_expression CHECK (expression ~ '\S'),
  UNIQUE(sp_code, title)
);

-- Create index for faster queries
CREATE INDEX idx_custom_formula_blocks_sp_code ON custom_formula_blocks(sp_code);
CREATE INDEX idx_custom_formula_blocks_created_by ON custom_formula_blocks(created_by);
CREATE INDEX idx_custom_formula_blocks_active ON custom_formula_blocks(is_active) WHERE is_active;

-- Enable Row Level Security
ALTER TABLE custom_formula_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies (only users with founder role can manage custom formulas)
CREATE POLICY "custom_formula_blocks_select_all" 
  ON custom_formula_blocks FOR SELECT 
  USING (is_active);

CREATE POLICY "custom_formula_blocks_insert_founders" 
  ON custom_formula_blocks FOR INSERT 
  WITH CHECK (public.is_founder());

CREATE POLICY "custom_formula_blocks_update_founders" 
  ON custom_formula_blocks FOR UPDATE 
  USING (
    created_by = auth.uid() OR
    public.is_founder()
  )
  WITH CHECK (
    created_by = auth.uid() OR
    public.is_founder()
  );

CREATE POLICY "custom_formula_blocks_delete_founders" 
  ON custom_formula_blocks FOR DELETE 
  USING (
    created_by = auth.uid() OR
    public.is_founder()
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_custom_formula_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_formula_blocks_updated_at
BEFORE UPDATE ON custom_formula_blocks
FOR EACH ROW
EXECUTE FUNCTION update_custom_formula_blocks_updated_at();
