-- Independently authored staging schema matching the supplied table contract.
-- Local credentials and data only. The supplied context DDL is not executed.
DO $$ BEGIN
  IF current_database() <> 'schedule_staging' THEN
    RAISE EXCEPTION 'This schema is only for schedule_staging';
  END IF;
END $$;
CREATE TABLE public.staging_marker (name text PRIMARY KEY);
INSERT INTO public.staging_marker VALUES ('wieikschedule-local-staging');
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), faculty text, date date NOT NULL,
  start_time time NOT NULL, duration_min integer NOT NULL DEFAULT 90, subject text NOT NULL,
  instructor text, room text, "group" text, type text, status text DEFAULT 'aktywne'
);
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), firebase_uid text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin','staff','starosta')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.faculties (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar NOT NULL, short_name varchar NOT NULL
);
CREATE TABLE public.user_added_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users,
  event_id uuid NOT NULL REFERENCES public.events,
  reason text NOT NULL DEFAULT 'makeup' CHECK (reason IN ('makeup','optional','manual')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','removed')),
  created_at timestamptz NOT NULL DEFAULT now(), removed_at timestamptz,
  schedule_name text NOT NULL
);
CREATE TABLE public.tag_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES public.users,
  scope text NOT NULL CHECK (scope IN ('system','custom')), key text NOT NULL, label text NOT NULL,
  color_hex text NOT NULL CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_event_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users,
  event_id uuid NOT NULL REFERENCES public.events, schedule_name text NOT NULL,
  tag_id uuid NOT NULL REFERENCES public.tag_definitions, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON public.events FOR SELECT USING (true);
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON public.faculties FOR SELECT USING (true);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_added_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_marker ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.events, public.faculties TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
