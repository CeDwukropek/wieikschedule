\set ON_ERROR_STOP on
-- Requires DB/migrations/20261023_plan_versions_and_hygiene.sql. Everything is rolled back.
BEGIN;
DO $$
DECLARE owner uuid; event_a uuid := gen_random_uuid(); event_b uuid := gen_random_uuid();
  before bigint; after bigint; other bigint;
BEGIN
  INSERT INTO public.events (id, faculty, date, start_time, subject, status)
    VALUES (event_a, 'SyntheticA', '2026-11-02', '08:00', 'Test', 'aktywne'),
           (event_b, 'SyntheticB', '2026-11-03', '08:00', 'Test', 'aktywne');
  IF (SELECT version FROM public.timetable_versions WHERE faculty = 'SyntheticA') IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'Insert did not create a version'; END IF;

  -- Rewriting a row with identical values (as the importer does) keeps the version.
  SELECT version INTO before FROM public.timetable_versions WHERE faculty = 'SyntheticA';
  UPDATE public.events SET room = room, subject = subject WHERE id = event_a;
  SELECT version INTO after FROM public.timetable_versions WHERE faculty = 'SyntheticA';
  IF after <> before THEN RAISE EXCEPTION 'No-op update bumped the version'; END IF;

  -- A real change bumps only its own plan.
  SELECT version INTO other FROM public.timetable_versions WHERE faculty = 'SyntheticB';
  UPDATE public.events SET room = 'A-1' WHERE id = event_a;
  IF (SELECT version FROM public.timetable_versions WHERE faculty = 'SyntheticA') <> before + 1 THEN
    RAISE EXCEPTION 'Change did not bump the version'; END IF;
  IF (SELECT version FROM public.timetable_versions WHERE faculty = 'SyntheticB') <> other THEN
    RAISE EXCEPTION 'Change bumped another plan'; END IF;

  -- Moving a row between plans bumps both.
  UPDATE public.events SET faculty = 'SyntheticB' WHERE id = event_a;
  IF (SELECT version FROM public.timetable_versions WHERE faculty = 'SyntheticA') <> before + 2
     OR (SELECT version FROM public.timetable_versions WHERE faculty = 'SyntheticB') <> other + 1 THEN
    RAISE EXCEPTION 'Move did not bump both plans'; END IF;

  -- The public role can read versions but not change them.
  SET LOCAL ROLE anon;
  PERFORM 1 FROM public.timetable_versions WHERE faculty = 'SyntheticA';
  BEGIN
    UPDATE public.timetable_versions SET version = 1;
    RAISE EXCEPTION 'Anon changed a version';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RESET ROLE;

  -- One active addition per class; a removed one can be added again.
  INSERT INTO public.users (firebase_uid) VALUES ('synthetic-plan-versions') RETURNING id INTO owner;
  INSERT INTO public.user_added_events (user_id, event_id, schedule_name) VALUES (owner, event_b, 'SyntheticB');
  BEGIN
    INSERT INTO public.user_added_events (user_id, event_id, schedule_name) VALUES (owner, event_b, 'SyntheticB');
    RAISE EXCEPTION 'Duplicate addition accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  UPDATE public.user_added_events SET status = 'removed', removed_at = now() WHERE user_id = owner;
  INSERT INTO public.user_added_events (user_id, event_id, schedule_name) VALUES (owner, event_b, 'SyntheticB');

  -- Expired previews older than 30 days are purged by the next preview.
  INSERT INTO public.schedule_change_proposals (user_id, event_id, operation, patch, expected_event, provider, session_id, expires_at)
    VALUES (owner, event_b, 'upsert', '{}', '{}', 'manual', 'old', now() - interval '31 days');
  INSERT INTO public.schedule_change_proposals (user_id, event_id, operation, patch, expected_event, provider, session_id)
    VALUES (owner, event_b, 'upsert', '{}', '{}', 'manual', 'new');
  IF EXISTS (SELECT 1 FROM public.schedule_change_proposals WHERE user_id = owner AND session_id = 'old') THEN
    RAISE EXCEPTION 'Old preview was not purged'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.schedule_change_proposals WHERE user_id = owner AND session_id = 'new') THEN
    RAISE EXCEPTION 'Current preview was purged'; END IF;

  -- Deleting the account removes its additions too.
  DELETE FROM public.users WHERE id = owner;
  IF EXISTS (SELECT 1 FROM public.user_added_events WHERE user_id = owner) THEN
    RAISE EXCEPTION 'Account deletion left additions'; END IF;
END $$;
ROLLBACK;
\echo plan versions test passed
