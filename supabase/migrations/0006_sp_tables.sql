-- Migration: SP Tables (normative tables with data)
-- Created: 2026-02-08
-- Purpose: Store normative tables with coefficients, tolerances, material properties for SP clauses

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sp_tables table
CREATE TABLE IF NOT EXISTS public.sp_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sp_code TEXT NOT NULL,
  clause_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sp_tables_sp_code ON public.sp_tables(sp_code);
CREATE INDEX IF NOT EXISTS idx_sp_tables_clause_id ON public.sp_tables(clause_id);
CREATE INDEX IF NOT EXISTS idx_sp_tables_created_by ON public.sp_tables(created_by);
CREATE INDEX IF NOT EXISTS idx_sp_tables_is_active ON public.sp_tables(is_active);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS set_sp_tables_updated_at ON public.sp_tables;
CREATE TRIGGER set_sp_tables_updated_at
  BEFORE UPDATE ON public.sp_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.sp_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view active tables
DROP POLICY IF EXISTS "Anyone can view active sp_tables" ON public.sp_tables;
CREATE POLICY "Anyone can view active sp_tables"
  ON public.sp_tables
  FOR SELECT
  USING (is_active = true);

-- Only founders can insert tables
DROP POLICY IF EXISTS "Founders can insert sp_tables" ON public.sp_tables;
CREATE POLICY "Founders can insert sp_tables"
  ON public.sp_tables
  FOR INSERT
  WITH CHECK (public.is_founder());

-- Only founders can update tables
DROP POLICY IF EXISTS "Founders can update sp_tables" ON public.sp_tables;
CREATE POLICY "Founders can update sp_tables"
  ON public.sp_tables
  FOR UPDATE
  USING (public.is_founder());

-- Only founders can delete tables (soft delete via is_active)
DROP POLICY IF EXISTS "Founders can delete sp_tables" ON public.sp_tables;
CREATE POLICY "Founders can delete sp_tables"
  ON public.sp_tables
  FOR DELETE
  USING (public.is_founder());

-- Grant permissions
GRANT SELECT ON public.sp_tables TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.sp_tables TO authenticated;

-- Comments
COMMENT ON TABLE public.sp_tables IS 'Normative tables with data for SP clauses (coefficients, tolerances, material properties)';
COMMENT ON COLUMN public.sp_tables.sp_code IS 'SP code this table belongs to';
COMMENT ON COLUMN public.sp_tables.clause_id IS 'Clause ID within the SP';
COMMENT ON COLUMN public.sp_tables.title IS 'Table title/name';
COMMENT ON COLUMN public.sp_tables.description IS 'Table description (optional)';
COMMENT ON COLUMN public.sp_tables.columns IS 'Column definitions: [{name: string, label: string, type: "text"|"number", unit?: string}]';
COMMENT ON COLUMN public.sp_tables.rows IS 'Table data rows: [[value1, value2, ...], ...]';
COMMENT ON COLUMN public.sp_tables.is_active IS 'Soft delete flag';
