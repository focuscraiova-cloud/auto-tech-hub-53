-- Fix profiles table: Users should only see their own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Add feedback content length constraint
ALTER TABLE public.procedure_feedback 
ADD CONSTRAINT feedback_content_length 
CHECK (char_length(content) <= 2000 AND char_length(content) >= 10);