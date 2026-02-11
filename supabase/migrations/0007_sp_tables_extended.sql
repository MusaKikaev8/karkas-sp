-- Migration: Extend SP Tables with notes and cell metadata
-- Created: 2026-02-08
-- Purpose: Add support for table notes and merged cells (rowspan/colspan)

-- Add notes and cell_meta columns to sp_tables if they don't exist
DO $$ 
BEGIN
  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sp_tables' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.sp_tables ADD COLUMN notes TEXT;
  END IF;

  -- Add cell_meta column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sp_tables' AND column_name = 'cell_meta'
  ) THEN
    ALTER TABLE public.sp_tables ADD COLUMN cell_meta JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update comments
COMMENT ON COLUMN public.sp_tables.notes IS 'Table notes/footnotes (markdown supported)';
COMMENT ON COLUMN public.sp_tables.cell_meta IS 'Cell metadata for merged cells: {"row,col": {rowspan?: number, colspan?: number, hidden?: boolean}}';

-- Example cell_meta structure:
-- {
--   "0,0": {"rowspan": 2},           // cell at row 0, col 0 spans 2 rows
--   "0,1": {"colspan": 2},           // cell at row 0, col 1 spans 2 columns
--   "1,0": {"hidden": true},         // cell at row 1, col 0 is hidden (covered by rowspan)
--   "2,3": {"rowspan": 2, "colspan": 2}  // cell spans both rows and columns
-- }


-- No schema changes needed for existing data - notes defaults to NULL, cell_meta defaults to empty object
