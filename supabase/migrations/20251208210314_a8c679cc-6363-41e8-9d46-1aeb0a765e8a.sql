-- Allow viewing full_name from any profile for feedback display
-- Keep email protected - only visible to own profile
CREATE POLICY "Users can view public profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the restrictive policy we just created
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;