-- One-time release reload: replaces every event with the reviewed fresh-load plan in one transaction.
-- Usage: psql -v changes_file=/path/changes.json -f fresh-load.sql (the file holds rpc.p_changes).
\set ON_ERROR_STOP on
\set changes `cat :changes_file`
BEGIN;
LOCK TABLE public.events, public.user_added_events, public.user_event_tags IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE has_overrides boolean := false; has_entries boolean := false;
BEGIN
  IF to_regclass('public.schedule_overrides') IS NOT NULL THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.schedule_overrides)' INTO has_overrides;
  END IF;
  IF to_regclass('public.plan_items') IS NOT NULL THEN
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.plan_items)' INTO has_entries;
  END IF;
  IF has_overrides OR has_entries OR EXISTS (SELECT 1 FROM public.user_added_events) OR EXISTS (SELECT 1 FROM public.user_event_tags) THEN
    RAISE EXCEPTION 'Fresh load refused: personal event data exists';
  END IF;
END $$;
DELETE FROM public.events;
SELECT public.apply_wieik_import('[]'::jsonb, :'changes'::jsonb) AS result;
COMMIT;
