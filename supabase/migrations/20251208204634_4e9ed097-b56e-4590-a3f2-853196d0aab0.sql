-- Drop existing public view policies and make them authenticated-only
DROP POLICY IF EXISTS "Anyone can view procedures" ON public.procedures;
CREATE POLICY "Authenticated users can view procedures" ON public.procedures
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view makes" ON public.makes;
CREATE POLICY "Authenticated users can view makes" ON public.makes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view models" ON public.models;
CREATE POLICY "Authenticated users can view models" ON public.models
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view variants" ON public.procedure_variants;
CREATE POLICY "Authenticated users can view variants" ON public.procedure_variants
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view tool guides" ON public.tool_guides;
CREATE POLICY "Authenticated users can view tool guides" ON public.tool_guides
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view linked procedures" ON public.linked_procedures;
CREATE POLICY "Authenticated users can view linked procedures" ON public.linked_procedures
  FOR SELECT TO authenticated USING (true);