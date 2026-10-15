-- Synthetic fixtures in the disposable test database only.
CREATE TABLE public.user_added_events (event_id uuid REFERENCES public.events(id));
CREATE TABLE public.user_event_tags (event_id uuid REFERENCES public.events(id));
GRANT ALL ON public.user_added_events, public.user_event_tags TO service_role;
\ir ../../DB/migrations/20261015_unlinked_bootstrap.sql

BEGIN;
UPDATE public.events SET source_system=NULL, source_key=NULL;
SET ROLE service_role;
SELECT public.bootstrap_wieik_import(public.fixture_snapshot(), jsonb_build_array(public.fixture_row(
  '00000000-0000-4000-8000-000000000001', 'bootstrap-source')));
DO $$
BEGIN
  BEGIN
    PERFORM public.bootstrap_wieik_import(public.fixture_snapshot(), '[]');
    RAISE EXCEPTION 'Bootstrap unexpectedly ran twice';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Bootstrap refused: source identities are already initialized' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;

BEGIN;
UPDATE public.events SET source_system=NULL, source_key=NULL;
INSERT INTO public.user_added_events SELECT id FROM public.events LIMIT 1;
SET ROLE service_role;
DO $$
BEGIN
  BEGIN
    PERFORM public.bootstrap_wieik_import(public.fixture_snapshot(), '[]');
    RAISE EXCEPTION 'Bootstrap ignored an addition';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Bootstrap refused: personal event data exists' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;

BEGIN;
UPDATE public.events SET source_system=NULL, source_key=NULL;
INSERT INTO public.user_event_tags SELECT id FROM public.events LIMIT 1;
SET ROLE service_role;
DO $$
BEGIN
  BEGIN
    PERFORM public.bootstrap_wieik_import(public.fixture_snapshot(), '[]');
    RAISE EXCEPTION 'Bootstrap ignored a tag';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Bootstrap refused: personal event data exists' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;

BEGIN;
UPDATE public.events SET source_system=NULL, source_key=NULL;
CREATE TABLE public.schedule_overrides (id integer);
GRANT ALL ON public.schedule_overrides TO service_role;
INSERT INTO public.schedule_overrides VALUES (1);
SET ROLE service_role;
DO $$
BEGIN
  BEGIN
    PERFORM public.bootstrap_wieik_import(public.fixture_snapshot(), '[]');
    RAISE EXCEPTION 'Bootstrap ignored an override';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Bootstrap refused: personal event data exists' THEN RAISE; END IF;
  END;
END;
$$;
ROLLBACK;
DO $$
BEGIN
  IF has_function_privilege('anon','public.bootstrap_wieik_import(jsonb,jsonb)','EXECUTE') OR
     has_function_privilege('authenticated','public.bootstrap_wieik_import(jsonb,jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'Bootstrap exposed to a user/agent';
  END IF;
END;
$$;
SELECT 'Bootstrap initial-state guards passed' AS result;
