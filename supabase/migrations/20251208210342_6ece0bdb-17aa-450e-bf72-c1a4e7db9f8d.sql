-- Revert: remove the public policy and add back the own-profile only policy
DROP POLICY IF EXISTS "Users can view public profile info" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);