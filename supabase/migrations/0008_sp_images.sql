-- Migration: SP Images (figures for SP clauses)
-- Created: 2026-02-09
-- Purpose: Store images (figures, schemes) linked to SP clauses

-- Create sp_images table
CREATE TABLE IF NOT EXISTS public.sp_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sp_code TEXT NOT NULL,
  clause_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sp_images_sp_code ON public.sp_images(sp_code);
CREATE INDEX IF NOT EXISTS idx_sp_images_clause_id ON public.sp_images(clause_id);
CREATE INDEX IF NOT EXISTS idx_sp_images_is_active ON public.sp_images(is_active);
CREATE INDEX IF NOT EXISTS idx_sp_images_sort_order ON public.sp_images(sort_order);
CREATE INDEX IF NOT EXISTS idx_sp_images_created_by ON public.sp_images(created_by);
-- Indexes for search by caption and alt_text
CREATE INDEX IF NOT EXISTS idx_sp_images_caption ON public.sp_images(caption);
CREATE INDEX IF NOT EXISTS idx_sp_images_alt_text ON public.sp_images(alt_text);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS set_sp_images_updated_at ON public.sp_images;
CREATE TRIGGER set_sp_images_updated_at
  BEFORE UPDATE ON public.sp_images
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.sp_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view active images
DROP POLICY IF EXISTS "Anyone can view active sp_images" ON public.sp_images;
CREATE POLICY "Anyone can view active sp_images"
  ON public.sp_images
  FOR SELECT
  USING (is_active = true);

-- Only founders can insert images
DROP POLICY IF EXISTS "Founders can insert sp_images" ON public.sp_images;
CREATE POLICY "Founders can insert sp_images"
  ON public.sp_images
  FOR INSERT
  WITH CHECK (public.is_founder());

-- Only founders can update images
DROP POLICY IF EXISTS "Founders can update sp_images" ON public.sp_images;
CREATE POLICY "Founders can update sp_images"
  ON public.sp_images
  FOR UPDATE
  USING (public.is_founder());

-- Only founders can delete images (soft delete via is_active)
DROP POLICY IF EXISTS "Founders can delete sp_images" ON public.sp_images;
CREATE POLICY "Founders can delete sp_images"
  ON public.sp_images
  FOR DELETE
  USING (public.is_founder());

-- Grant permissions
GRANT SELECT ON public.sp_images TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.sp_images TO authenticated;

-- Comments
COMMENT ON TABLE public.sp_images IS 'Figures and images linked to SP clauses';
COMMENT ON COLUMN public.sp_images.sp_code IS 'SP code this image belongs to';
COMMENT ON COLUMN public.sp_images.clause_id IS 'Clause ID within the SP';
COMMENT ON COLUMN public.sp_images.image_url IS 'Public URL to image file';
COMMENT ON COLUMN public.sp_images.caption IS 'Image caption (optional)';
COMMENT ON COLUMN public.sp_images.alt_text IS 'Alt text for accessibility';
COMMENT ON COLUMN public.sp_images.sort_order IS 'Sort order within clause';
COMMENT ON COLUMN public.sp_images.is_active IS 'Soft delete flag';
