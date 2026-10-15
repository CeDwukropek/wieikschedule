-- Run only on a disposable PostgreSQL database. No production credentials.
\set ON_ERROR_STOP on
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), faculty text, date date NOT NULL,
  start_time time NOT NULL, duration_min integer NOT NULL DEFAULT 90, subject text NOT NULL,
  instructor text, room text, "group" text, type text, status text DEFAULT 'aktywne'
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON public.events FOR SELECT USING (true);
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
CREATE TABLE public.fixture_private_links (
  event_id uuid NOT NULL REFERENCES public.events(id), marker text NOT NULL
);
\ir ../../DB/migrations/20261014_wieik_import.sql

-- Helpers in the disposable test database only.
CREATE FUNCTION public.fixture_snapshot() RETURNS jsonb LANGUAGE sql AS $$
  SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.id), '[]'::jsonb) FROM public.events e
$$;
CREATE FUNCTION public.fixture_row(event_id uuid, candidate text, room_value text DEFAULT '101')
RETURNS jsonb LANGUAGE sql AS $$
  SELECT jsonb_build_object('id', event_id, 'faculty', 'TEST', 'date', '2026-10-05',
    'start_time', '09:00:00', 'duration_min', 90, 'subject', 'Synthetic subject',
    'instructor', NULL, 'room', room_value, 'group', 'L1', 'type', 'Labolatorium',
    'status', 'aktywne', 'source_system', 'wieik-v1', 'source_key', candidate)
$$;

-- RLS and function grants: public readers and Firebase users cannot import.
DO $$
BEGIN
  IF has_function_privilege('anon', 'public.apply_wieik_import(jsonb,jsonb)', 'EXECUTE') OR
     has_function_privilege('authenticated', 'public.apply_wieik_import(jsonb,jsonb)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Import function exposed to a user/agent';
  END IF;
END;
$$;
SET ROLE anon;
DO $$
BEGIN
  BEGIN
    PERFORM public.apply_wieik_import('[]', '[]');
    RAISE EXCEPTION 'Anonymous import unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END;
$$;
RESET ROLE;

SET ROLE service_role;
SELECT public.apply_wieik_import('[]', jsonb_build_array(public.fixture_row(
  '00000000-0000-4000-8000-000000000001', 'source-a')));
SELECT public.apply_wieik_import(public.fixture_snapshot(), '[]');
RESET ROLE;
INSERT INTO public.fixture_private_links VALUES
  ('00000000-0000-4000-8000-000000000001', 'personal tag/addition');

DO $$
DECLARE
  before_snapshot jsonb;
  change jsonb;
  result jsonb;
BEGIN
  IF (SELECT count(*) FROM public.events) <> 1 THEN RAISE EXCEPTION 'Repeated import duplicated rows'; END IF;
  before_snapshot := public.fixture_snapshot();
  change := public.fixture_row('00000000-0000-4000-8000-000000000001', 'source-a', NULL);
  result := public.apply_wieik_import(before_snapshot, jsonb_build_array(change));
  IF result <> '{"inserted":0,"updated":1}'::jsonb OR
     (SELECT room FROM public.events LIMIT 1) IS NOT NULL THEN RAISE EXCEPTION 'NULL/update semantics failed'; END IF;

  -- Reviewed date/identity movement updates the same PK, preserving private FKs.
  change := change || '{"date":"2026-10-06","source_key":"source-moved"}'::jsonb;
  PERFORM public.apply_wieik_import(public.fixture_snapshot(), jsonb_build_array(change));
  IF (SELECT count(*) FROM public.fixture_private_links l JOIN public.events e ON e.id=l.event_id
      WHERE e.date='2026-10-06') <> 1 THEN RAISE EXCEPTION 'Private FK lost on move'; END IF;

  -- Retirement and reappearance preserve the source row and all relations.
  change := change || '{"status":"nieaktywne"}'::jsonb;
  PERFORM public.apply_wieik_import(public.fixture_snapshot(), jsonb_build_array(change));
  change := change || '{"status":"aktywne"}'::jsonb;
  PERFORM public.apply_wieik_import(public.fixture_snapshot(), jsonb_build_array(change));
  IF (SELECT count(*) FROM public.events) <> 1 OR
     (SELECT count(*) FROM public.fixture_private_links) <> 1 THEN RAISE EXCEPTION 'Retirement deleted relations'; END IF;

  -- A review against an old snapshot never overwrites a subsequent edit.
  before_snapshot := public.fixture_snapshot();
  UPDATE public.events SET room='new concurrent value';
  BEGIN
    PERFORM public.apply_wieik_import(before_snapshot, jsonb_build_array(change));
    RAISE EXCEPTION 'Stale snapshot was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Events changed after review%' THEN RAISE; END IF;
  END;
  IF (SELECT room FROM public.events LIMIT 1) <> 'new concurrent value' THEN RAISE EXCEPTION 'Concurrent update lost'; END IF;

  -- A source collision rolls back every preceding change in that RPC call.
  before_snapshot := public.fixture_snapshot();
  change := public.fixture_row('00000000-0000-4000-8000-000000000001', 'source-moved', 'should roll back');
  BEGIN
    PERFORM public.apply_wieik_import(before_snapshot, jsonb_build_array(change,
      public.fixture_row('00000000-0000-4000-8000-000000000002', 'source-moved')));
    RAISE EXCEPTION 'Source collision was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  IF public.fixture_snapshot() <> before_snapshot THEN RAISE EXCEPTION 'Failed import partially committed'; END IF;

  -- Duplicate IDs and non-allowlisted fields are rejected atomically.
  BEGIN
    PERFORM public.apply_wieik_import(before_snapshot, jsonb_build_array(change, change));
    RAISE EXCEPTION 'Duplicate UUID accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Duplicate UUID in changes' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.apply_wieik_import(before_snapshot, jsonb_build_array(change || '{"extra":"bad"}'::jsonb));
    RAISE EXCEPTION 'Unknown field accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Invalid imported row' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.apply_wieik_import(before_snapshot, jsonb_build_array(change || '{"room":true}'::jsonb));
    RAISE EXCEPTION 'Invalid JSON type accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Invalid imported row' THEN RAISE; END IF;
  END;
END;
$$;

-- Adopt an existing UUID with private references, without re-inserting it.
INSERT INTO public.events (id, date, start_time, subject) VALUES
  ('00000000-0000-4000-8000-000000000003', '2026-10-07', '10:00', 'Legacy synthetic');
INSERT INTO public.fixture_private_links VALUES
  ('00000000-0000-4000-8000-000000000003', 'legacy relation');
SET ROLE service_role;
SELECT public.apply_wieik_import(public.fixture_snapshot(), jsonb_build_array(public.fixture_row(
  '00000000-0000-4000-8000-000000000003', 'adopted-source')));
RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.events) <> 2 OR
     (SELECT count(*) FROM public.fixture_private_links) <> 2 OR
     (SELECT source_key FROM public.events WHERE id='00000000-0000-4000-8000-000000000003') <> 'adopted-source'
  THEN RAISE EXCEPTION 'Legacy adoption did not preserve UUID/FK'; END IF;
END;
$$;
-- Deferred uniqueness permits a reviewed reassignment of source keys while
-- preserving both UUIDs, even when the first UPDATE transiently collides.
DO $$
BEGIN
  PERFORM public.apply_wieik_import(public.fixture_snapshot(), jsonb_build_array(
    public.fixture_row('00000000-0000-4000-8000-000000000001', 'adopted-source'),
    public.fixture_row('00000000-0000-4000-8000-000000000003', 'source-moved')));
  IF (SELECT count(*) FROM public.fixture_private_links) <> 2 THEN
    RAISE EXCEPTION 'Source key reassignment lost private relations';
  END IF;
END;
$$;
SELECT 'Importer database tests passed' AS result;
\ir bootstrap-database-test.sql
