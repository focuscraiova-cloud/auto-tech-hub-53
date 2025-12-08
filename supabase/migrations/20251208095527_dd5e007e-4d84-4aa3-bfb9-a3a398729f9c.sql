-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 1. User Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. User Roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 3. User Owned Tools
CREATE TABLE public.user_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_name)
);

ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tools" ON public.user_tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tools" ON public.user_tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tools" ON public.user_tools FOR DELETE USING (auth.uid() = user_id);

-- 4. Vehicle Makes
CREATE TABLE public.makes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.makes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view makes" ON public.makes FOR SELECT USING (true);
CREATE POLICY "Admins can insert makes" ON public.makes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update makes" ON public.makes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete makes" ON public.makes FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 5. Vehicle Models
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id UUID REFERENCES public.makes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  years TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view models" ON public.models FOR SELECT USING (true);
CREATE POLICY "Admins can insert models" ON public.models FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update models" ON public.models FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete models" ON public.models FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 6. Procedures
CREATE TABLE public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  time_minutes INTEGER,
  cost_min DECIMAL,
  cost_max DECIMAL,
  chip_type TEXT,
  pin_code TEXT,
  tools JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view procedures" ON public.procedures FOR SELECT USING (true);
CREATE POLICY "Admins can insert procedures" ON public.procedures FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update procedures" ON public.procedures FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete procedures" ON public.procedures FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 7. Procedure Variants (EEPROM/hardware specific)
CREATE TABLE public.procedure_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  hardware_type TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.procedure_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view variants" ON public.procedure_variants FOR SELECT USING (true);
CREATE POLICY "Admins can insert variants" ON public.procedure_variants FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update variants" ON public.procedure_variants FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete variants" ON public.procedure_variants FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 8. Tool Guides (tool-specific steps per variant)
CREATE TABLE public.tool_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES public.procedure_variants(id) ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  steps JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool guides" ON public.tool_guides FOR SELECT USING (true);
CREATE POLICY "Admins can insert tool guides" ON public.tool_guides FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tool guides" ON public.tool_guides FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tool guides" ON public.tool_guides FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 9. Linked Procedures
CREATE TABLE public.linked_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE NOT NULL,
  linked_procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE NOT NULL,
  relationship TEXT DEFAULT 'related',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.linked_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view linked procedures" ON public.linked_procedures FOR SELECT USING (true);
CREATE POLICY "Admins can insert linked procedures" ON public.linked_procedures FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete linked procedures" ON public.linked_procedures FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 10. Procedure Feedback
CREATE TABLE public.procedure_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID REFERENCES public.procedures(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES public.procedure_variants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'tip',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.procedure_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approved feedback" ON public.procedure_feedback FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own feedback" ON public.procedure_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update feedback" ON public.procedure_feedback FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete feedback" ON public.procedure_feedback FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 11. Trigger for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at
  BEFORE UPDATE ON public.procedures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();