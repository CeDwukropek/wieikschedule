-- STAGING FIRST. This migration is not applied by the application build.
-- Stop the old INSERT writer, back up the database, review triggers/FKs and
-- prepare identity mappings before calling apply_wieik_import on production.
BEGIN;

ALTER TABLE public.events
  ADD COLUMN source_system text,
  ADD COLUMN source_key text,
  ADD CONSTRAINT events_source_pair CHECK (
    (source_system IS NULL AND source_key IS NULL) OR
    (source_system IS NOT NULL AND source_system <> '' AND
     source_key IS NOT NULL AND source_key <> '' AND length(source_key) <= 2048)
  ),
  ADD CONSTRAINT events_source_identity UNIQUE (source_system, source_key)
    DEFERRABLE INITIALLY IMMEDIATE;

-- Only the trusted importer can execute this function. Never put its
-- privileged credential into the browser or either agent's tools.
CREATE FUNCTION public.apply_wieik_import(p_expected jsonb, p_changes jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  current_snapshot jsonb;
  item jsonb;
  new_row public.events%ROWTYPE;
  old_row public.events%ROWTYPE;
  changed integer := 0;
  inserted integer := 0;
BEGIN
  IF p_expected IS NULL OR p_changes IS NULL OR
     jsonb_typeof(p_expected) <> 'array' OR jsonb_typeof(p_changes) <> 'array' THEN
    RAISE EXCEPTION 'Expected snapshot and changes must be arrays';
  END IF;
  IF jsonb_array_length(p_expected) > 100000 OR jsonb_array_length(p_changes) > 50000 THEN
    RAISE EXCEPTION 'Import exceeds row limit';
  END IF;

  -- Serialize importers and prevent lost updates after the offline review.
  -- Reads continue; concurrent INSERT/UPDATE/DELETE wait for this transaction.
  LOCK TABLE public.events IN SHARE ROW EXCLUSIVE MODE;
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id, 'faculty', e.faculty, 'date', e.date,
    'start_time', e.start_time, 'duration_min', e.duration_min,
    'subject', e.subject, 'instructor', e.instructor, 'room', e.room,
    'group', e."group", 'type', e.type, 'status', e.status,
    'source_system', e.source_system, 'source_key', e.source_key
  ) ORDER BY e.id), '[]'::jsonb) INTO current_snapshot FROM public.events e;
  IF current_snapshot IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'Events changed after review; export again and regenerate the plan';
  END IF;

  IF (SELECT count(*) FROM jsonb_array_elements(p_changes)) <>
     (SELECT count(DISTINCT value->>'id') FROM jsonb_array_elements(p_changes)) THEN
    RAISE EXCEPTION 'Duplicate UUID in changes';
  END IF;
  SET CONSTRAINTS public.events_source_identity DEFERRED;
  FOR item IN SELECT value FROM jsonb_array_elements(p_changes) LOOP
    IF jsonb_typeof(item) <> 'object' OR
       (SELECT count(*) FROM jsonb_object_keys(item)) <> 13 OR
       NOT (item ?& ARRAY['id','faculty','date','start_time','duration_min','subject',
         'instructor','room','group','type','status','source_system','source_key']) OR
       item->>'source_system' IS DISTINCT FROM 'wieik-v1' OR
       jsonb_typeof(item->'source_key') <> 'string' OR
       item->>'source_key' = '' OR length(item->>'source_key') > 2048 OR
       jsonb_typeof(item->'duration_min') <> 'number' OR
       EXISTS (SELECT 1 FROM jsonb_each(item) AS field
         WHERE field.key <> 'duration_min' AND jsonb_typeof(field.value) NOT IN ('string','null')) OR
       item->>'date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' OR
       item->>'start_time' !~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:00$' OR
       item->>'status' IS NULL OR item->>'status' NOT IN ('aktywne','nieaktywne','wolne') THEN
      RAISE EXCEPTION 'Invalid imported row';
    END IF;
    new_row := jsonb_populate_record(NULL::public.events, item);
    IF new_row.id IS NULL OR new_row.date IS NULL OR new_row.start_time IS NULL OR
       new_row.duration_min IS NULL OR new_row.duration_min < 1 OR new_row.duration_min > 1440 OR
       new_row.subject IS NULL OR btrim(new_row.subject) = '' THEN
      RAISE EXCEPTION 'Missing or invalid event fields';
    END IF;
    SELECT * INTO old_row FROM public.events WHERE id = new_row.id;
    IF FOUND THEN
      IF old_row.source_system IS NOT NULL AND old_row.source_system <> 'wieik-v1' THEN
        RAISE EXCEPTION 'Cannot replace another source';
      END IF;
      UPDATE public.events SET
        faculty = new_row.faculty, date = new_row.date, start_time = new_row.start_time,
        duration_min = new_row.duration_min, subject = new_row.subject,
        instructor = new_row.instructor, room = new_row.room, "group" = new_row."group",
        type = new_row.type, status = new_row.status,
        source_system = new_row.source_system, source_key = new_row.source_key
      WHERE id = new_row.id;
      changed := changed + 1;
    ELSE
      INSERT INTO public.events (id, faculty, date, start_time, duration_min, subject,
        instructor, room, "group", type, status, source_system, source_key)
      VALUES (new_row.id, new_row.faculty, new_row.date, new_row.start_time, new_row.duration_min,
        new_row.subject, new_row.instructor, new_row.room, new_row."group", new_row.type,
        new_row.status, new_row.source_system, new_row.source_key);
      inserted := inserted + 1;
    END IF;
  END LOOP;
  -- Force identity collisions to fail before returning the result.
  SET CONSTRAINTS public.events_source_identity IMMEDIATE;
  RETURN jsonb_build_object('inserted', inserted, 'updated', changed);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_wieik_import(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_wieik_import(jsonb, jsonb) TO service_role;
COMMENT ON FUNCTION public.apply_wieik_import(jsonb, jsonb) IS
  'Reviewed atomic source import; preserves existing UUIDs and never deletes events. Not an AI tool.';

COMMIT;
