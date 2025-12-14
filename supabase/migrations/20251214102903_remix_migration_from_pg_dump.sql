CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: linked_procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linked_procedures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    procedure_id uuid NOT NULL,
    linked_procedure_id uuid NOT NULL,
    relationship text DEFAULT 'related'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: makes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.makes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    make_id uuid NOT NULL,
    name text NOT NULL,
    years text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: procedure_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedure_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    procedure_id uuid NOT NULL,
    variant_id uuid,
    user_id uuid NOT NULL,
    content text NOT NULL,
    feedback_type text DEFAULT 'tip'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    CONSTRAINT feedback_content_length CHECK (((char_length(content) <= 2000) AND (char_length(content) >= 10)))
);


--
-- Name: procedure_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedure_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    procedure_id uuid NOT NULL,
    variant_name text NOT NULL,
    hardware_type text,
    notes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: procedures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.procedures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    description text,
    difficulty text DEFAULT 'medium'::text NOT NULL,
    time_minutes integer,
    cost_min numeric,
    cost_max numeric,
    chip_type text,
    pin_code text,
    tools jsonb DEFAULT '[]'::jsonb,
    steps jsonb DEFAULT '[]'::jsonb,
    notes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tool_guides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tool_guides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid NOT NULL,
    tool_name text NOT NULL,
    steps jsonb DEFAULT '[]'::jsonb,
    notes jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tool_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: linked_procedures linked_procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linked_procedures
    ADD CONSTRAINT linked_procedures_pkey PRIMARY KEY (id);


--
-- Name: makes makes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.makes
    ADD CONSTRAINT makes_name_key UNIQUE (name);


--
-- Name: makes makes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.makes
    ADD CONSTRAINT makes_pkey PRIMARY KEY (id);


--
-- Name: models models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_pkey PRIMARY KEY (id);


--
-- Name: procedure_feedback procedure_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedure_feedback
    ADD CONSTRAINT procedure_feedback_pkey PRIMARY KEY (id);


--
-- Name: procedure_variants procedure_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedure_variants
    ADD CONSTRAINT procedure_variants_pkey PRIMARY KEY (id);


--
-- Name: procedures procedures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: tool_guides tool_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_guides
    ADD CONSTRAINT tool_guides_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: user_tools user_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_pkey PRIMARY KEY (id);


--
-- Name: user_tools user_tools_user_id_tool_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_user_id_tool_name_key UNIQUE (user_id, tool_name);


--
-- Name: procedures update_procedures_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: linked_procedures linked_procedures_linked_procedure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linked_procedures
    ADD CONSTRAINT linked_procedures_linked_procedure_id_fkey FOREIGN KEY (linked_procedure_id) REFERENCES public.procedures(id) ON DELETE CASCADE;


--
-- Name: linked_procedures linked_procedures_procedure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linked_procedures
    ADD CONSTRAINT linked_procedures_procedure_id_fkey FOREIGN KEY (procedure_id) REFERENCES public.procedures(id) ON DELETE CASCADE;


--
-- Name: models models_make_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.models
    ADD CONSTRAINT models_make_id_fkey FOREIGN KEY (make_id) REFERENCES public.makes(id) ON DELETE CASCADE;


--
-- Name: procedure_feedback procedure_feedback_procedure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedure_feedback
    ADD CONSTRAINT procedure_feedback_procedure_id_fkey FOREIGN KEY (procedure_id) REFERENCES public.procedures(id) ON DELETE CASCADE;


--
-- Name: procedure_feedback procedure_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedure_feedback
    ADD CONSTRAINT procedure_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: procedure_feedback procedure_feedback_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedure_feedback
    ADD CONSTRAINT procedure_feedback_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.procedure_variants(id) ON DELETE SET NULL;


--
-- Name: procedure_variants procedure_variants_procedure_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedure_variants
    ADD CONSTRAINT procedure_variants_procedure_id_fkey FOREIGN KEY (procedure_id) REFERENCES public.procedures(id) ON DELETE CASCADE;


--
-- Name: procedures procedures_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.procedures
    ADD CONSTRAINT procedures_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tool_guides tool_guides_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tool_guides
    ADD CONSTRAINT tool_guides_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.procedure_variants(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_tools user_tools_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tools
    ADD CONSTRAINT user_tools_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: procedure_feedback Admins can delete feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete feedback" ON public.procedure_feedback FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: linked_procedures Admins can delete linked procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete linked procedures" ON public.linked_procedures FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: makes Admins can delete makes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete makes" ON public.makes FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: models Admins can delete models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete models" ON public.models FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedures Admins can delete procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete procedures" ON public.procedures FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tool_guides Admins can delete tool guides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete tool guides" ON public.tool_guides FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedure_variants Admins can delete variants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete variants" ON public.procedure_variants FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: linked_procedures Admins can insert linked procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert linked procedures" ON public.linked_procedures FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: makes Admins can insert makes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert makes" ON public.makes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: models Admins can insert models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert models" ON public.models FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedures Admins can insert procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert procedures" ON public.procedures FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tool_guides Admins can insert tool guides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert tool guides" ON public.tool_guides FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedure_variants Admins can insert variants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert variants" ON public.procedure_variants FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedure_feedback Admins can update feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update feedback" ON public.procedure_feedback FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: makes Admins can update makes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update makes" ON public.makes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: models Admins can update models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update models" ON public.models FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedures Admins can update procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update procedures" ON public.procedures FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: tool_guides Admins can update tool guides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update tool guides" ON public.tool_guides FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: procedure_variants Admins can update variants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update variants" ON public.procedure_variants FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: linked_procedures Authenticated users can view linked procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view linked procedures" ON public.linked_procedures FOR SELECT TO authenticated USING (true);


--
-- Name: makes Authenticated users can view makes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view makes" ON public.makes FOR SELECT TO authenticated USING (true);


--
-- Name: models Authenticated users can view models; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view models" ON public.models FOR SELECT TO authenticated USING (true);


--
-- Name: procedures Authenticated users can view procedures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view procedures" ON public.procedures FOR SELECT TO authenticated USING (true);


--
-- Name: tool_guides Authenticated users can view tool guides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view tool guides" ON public.tool_guides FOR SELECT TO authenticated USING (true);


--
-- Name: procedure_variants Authenticated users can view variants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view variants" ON public.procedure_variants FOR SELECT TO authenticated USING (true);


--
-- Name: user_roles Only admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_tools Users can delete own tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own tools" ON public.user_tools FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: procedure_feedback Users can insert own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own feedback" ON public.procedure_feedback FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_tools Users can insert own tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own tools" ON public.user_tools FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: procedure_feedback Users can view approved feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view approved feedback" ON public.procedure_feedback FOR SELECT USING (((status = 'approved'::text) OR (auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_tools Users can view own tools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own tools" ON public.user_tools FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: linked_procedures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.linked_procedures ENABLE ROW LEVEL SECURITY;

--
-- Name: makes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.makes ENABLE ROW LEVEL SECURITY;

--
-- Name: models; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

--
-- Name: procedure_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.procedure_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: procedure_variants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.procedure_variants ENABLE ROW LEVEL SECURITY;

--
-- Name: procedures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: tool_guides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tool_guides ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tools; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


