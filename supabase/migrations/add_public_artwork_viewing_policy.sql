-- Database-level security for public artwork viewing
-- This migration allows anyone to view artworks by ID (for public sharing)

-- ============================================================================
-- PART 1: Add public viewing policy for artworks
-- ============================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view artworks by id" ON artworks;

-- Policy: Anyone can view artworks by ID (for public sharing)
-- This allows artworks to be shared publicly via URL
CREATE POLICY "Public can view artworks by id" ON artworks
  FOR SELECT 
  USING (true);

-- Note: This policy allows public read access to all artworks
-- If you want to restrict this further (e.g., only verified artworks),
-- you can modify the USING clause:
-- USING (status = 'verified')

-- ============================================================================
-- PART 2: Keep existing owner policies
-- ============================================================================

-- The existing policies for INSERT, UPDATE, DELETE remain unchanged:
-- - Users can only insert their own artworks
-- - Users can only update their own artworks  
-- - Users can only delete their own artworks

-- This ensures that while anyone can VIEW artworks, only owners can modify them

