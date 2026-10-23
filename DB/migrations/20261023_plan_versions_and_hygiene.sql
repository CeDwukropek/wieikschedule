-- STAGING FIRST. Requires 20261014_wieik_import.sql, 20261015_personal_overrides.sql
-- and 20261021_calendar_links.sql. Additive: nothing is renamed and no user data is deleted
-- except expired previews (30 days) and pairing codes (1 day).
BEGIN;

-- 1. Plan versions: clients and the calendar feed download a whole plan only after it changed.
CREATE TABLE public.timetable_versions (
  faculty text PRIMARY KEY CHECK (length(faculty) BETWEEN 1 AND 256),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON public.timetable_versions FOR SELECT USING (true);
REVOKE ALL ON public.timetable_versions FROM PUBLIC;
GRANT SELECT ON public.timetable_versions TO anon, authenticated, service_role;
INSERT INTO public.timetable_versions (faculty)
  SELECT DISTINCT faculty FROM public.events WHERE faculty IS NOT NULL AND faculty <> '';

-- A statement may touch many rows; each affected plan is bumped once.
CREATE FUNCTION public.bump_timetable_versions(faculties text[])
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
  INSERT INTO public.timetable_versions AS current (faculty)
    SELECT DISTINCT item FROM unnest(faculties) AS item WHERE item IS NOT NULL AND item <> ''
  ON CONFLICT (faculty) DO UPDATE SET version = current.version + 1, updated_at = now();
$$;
-- The importer rewrites unchanged rows, so updates count only when a row actually differs.
CREATE FUNCTION public.events_bump_timetable_versions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.bump_timetable_versions(ARRAY(SELECT faculty FROM new_rows));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.bump_timetable_versions(ARRAY(SELECT faculty FROM old_rows));
  ELSE
    PERFORM public.bump_timetable_versions(ARRAY(
      SELECT unnest(ARRAY[old_row.faculty, new_row.faculty])
      FROM old_rows AS old_row JOIN new_rows AS new_row USING (id)
      WHERE old_row IS DISTINCT FROM new_row));
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER events_versions_insert AFTER INSERT ON public.events
  REFERENCING NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION public.events_bump_timetable_versions();
CREATE TRIGGER events_versions_update AFTER UPDATE ON public.events
  REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows FOR EACH STATEMENT EXECUTE FUNCTION public.events_bump_timetable_versions();
CREATE TRIGGER events_versions_delete AFTER DELETE ON public.events
  REFERENCING OLD TABLE AS old_rows FOR EACH STATEMENT EXECUTE FUNCTION public.events_bump_timetable_versions();
REVOKE ALL ON FUNCTION public.bump_timetable_versions(text[]), public.events_bump_timetable_versions()
  FROM PUBLIC, anon, authenticated;

-- 2. Every plan query filters active rows by faculty and date; personal additions by owner and plan.
CREATE INDEX events_active_faculty_date_idx ON public.events (faculty, date, start_time)
  WHERE status IS NULL OR status IN ('aktywne', 'wolne');
CREATE INDEX user_added_events_owner_idx ON public.user_added_events (user_id, schedule_name)
  WHERE status = 'active';

-- 3. A class can be added to one plan once. Older duplicates are kept as removed, not deleted.
DO $$
DECLARE merged integer;
BEGIN
  WITH ranked AS (
    SELECT id, row_number() OVER (PARTITION BY user_id, event_id ORDER BY created_at, id) AS position
    FROM public.user_added_events WHERE status = 'active')
  UPDATE public.user_added_events AS added SET status = 'removed', removed_at = now()
  FROM ranked WHERE ranked.id = added.id AND ranked.position > 1;
  GET DIAGNOSTICS merged = ROW_COUNT;
  IF merged > 0 THEN RAISE NOTICE 'Marked % duplicate added events as removed', merged; END IF;
END $$;
CREATE UNIQUE INDEX user_added_events_active_key ON public.user_added_events (user_id, event_id)
  WHERE status = 'active';

-- 4. Deleting an account removes all of its private rows.
DO $$
DECLARE target record;
BEGIN
  FOR target IN
    SELECT constraint_row.conname, constraint_row.conrelid::regclass AS owner_table, attribute.attname
    FROM pg_constraint AS constraint_row
    JOIN pg_attribute AS attribute ON attribute.attrelid = constraint_row.conrelid
      AND attribute.attnum = constraint_row.conkey[1]
    WHERE constraint_row.contype = 'f' AND constraint_row.confrelid = 'public.users'::regclass
      AND constraint_row.confdeltype <> 'c' AND array_length(constraint_row.conkey, 1) = 1
      AND constraint_row.conrelid IN ('public.user_added_events'::regclass, 'public.user_event_tags'::regclass,
        'public.tag_definitions'::regclass)
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', target.owner_table, target.conname);
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.users(id) ON DELETE CASCADE',
      target.owner_table, target.conname, target.attname);
  END LOOP;
END $$;

-- 5. Expired previews and pairing codes are purged whenever new ones are written.
CREATE INDEX schedule_proposals_expiry_idx ON public.schedule_change_proposals (expires_at);
CREATE FUNCTION public.purge_schedule_ephemera()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  DELETE FROM public.schedule_change_proposals WHERE expires_at < now() - interval '30 days';
  DELETE FROM public.calendar_link_codes WHERE expires_at < now() - interval '1 day';
  RETURN NULL;
END $$;
CREATE TRIGGER purge_after_proposal AFTER INSERT ON public.schedule_change_proposals
  FOR EACH STATEMENT EXECUTE FUNCTION public.purge_schedule_ephemera();
CREATE TRIGGER purge_after_link_code AFTER INSERT ON public.calendar_link_codes
  FOR EACH STATEMENT EXECUTE FUNCTION public.purge_schedule_ephemera();
REVOKE ALL ON FUNCTION public.purge_schedule_ephemera() FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
