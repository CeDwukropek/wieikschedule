-- Run only in an empty disposable PostgreSQL database.
-- psql -v ON_ERROR_STOP=1 -v migration_path=/path/to/migration.sql -f this-file.sql
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE TABLE public.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), firebase_uid text UNIQUE NOT NULL);
CREATE TABLE public.events (id uuid PRIMARY KEY, faculty text, status text);
CREATE TABLE public.user_added_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users,
  event_id uuid NOT NULL REFERENCES public.events, reason text NOT NULL,
  status text NOT NULL, created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX unique_active_link ON public.user_added_events (user_id, event_id) WHERE status = 'active';
GRANT SELECT, INSERT, UPDATE ON public.users, public.events, public.user_added_events TO service_role;
INSERT INTO public.events VALUES
  ('00000000-0000-0000-0000-000000000001', 'A', 'aktywne'),
  ('00000000-0000-0000-0000-000000000002', 'A', 'wolne');

\i :migration_path

SET ROLE service_role;
DO $$
DECLARE first_result jsonb; second_result jsonb;
BEGIN
  first_result := public.add_my_plan_event('user-a', '00000000-0000-0000-0000-000000000001', 'B');
  ASSERT first_result->>'error' = 'EVENT_SCHEDULE_MISMATCH';
  ASSERT (SELECT count(*) FROM public.users) = 0, 'Invalid requests must not create users';
  first_result := public.add_my_plan_event('user-a', '00000000-0000-0000-0000-000000000002', 'A');
  ASSERT first_result->>'error' = 'EVENT_NOT_FOUND';
  first_result := public.add_my_plan_event('user-a', '00000000-0000-0000-0000-000000000001', 'A');
  ASSERT first_result->>'ok' = 'true';
  ASSERT first_result->>'already_added' = 'false';
  second_result := public.add_my_plan_event('user-a', '00000000-0000-0000-0000-000000000001', 'A');
  ASSERT second_result->>'already_added' = 'true';
  ASSERT first_result->'added_event'->>'id' = second_result->'added_event'->>'id';
  ASSERT (SELECT count(*) FROM public.user_added_events) = 1;
  PERFORM public.add_my_plan_event('user-b', '00000000-0000-0000-0000-000000000001', 'A');
  ASSERT (SELECT count(*) FROM public.user_added_events) = 2, 'Users must remain isolated';
  UPDATE public.user_added_events SET status = 'removed'
    WHERE id = (first_result->'added_event'->>'id')::uuid;
  second_result := public.add_my_plan_event('user-a', '00000000-0000-0000-0000-000000000001', 'A');
  ASSERT second_result->>'already_added' = 'false';
  ASSERT first_result->'added_event'->>'id' <> second_result->'added_event'->>'id';
END $$;
RESET ROLE;

DO $$ BEGIN
  ASSERT NOT has_function_privilege('anon', 'public.add_my_plan_event(text,uuid,text,text)', 'EXECUTE');
  ASSERT NOT has_function_privilege('authenticated', 'public.add_my_plan_event(text,uuid,text,text)', 'EXECUTE');
END $$;

ALTER TABLE public.user_added_events ADD COLUMN schedule_name text;
UPDATE public.user_added_events SET schedule_name = 'A';
ALTER TABLE public.user_added_events ALTER COLUMN schedule_name SET NOT NULL;
SET ROLE service_role;
DO $$ DECLARE result jsonb; BEGIN
  result := public.add_my_plan_event('legacy-user', '00000000-0000-0000-0000-000000000001', 'A');
  ASSERT result->>'ok' = 'true';
  ASSERT (SELECT schedule_name FROM public.user_added_events WHERE id = (result->'added_event'->>'id')::uuid) = 'A';
END $$;
RESET ROLE;
