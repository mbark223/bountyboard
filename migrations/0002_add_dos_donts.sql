-- Add dos and donts columns to briefs table
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS dos TEXT[];
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS donts TEXT[];
