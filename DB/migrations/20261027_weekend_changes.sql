-- STAGING FIRST. Requires 20261015_personal_overrides.sql. A private change may move a class to Saturday or
-- Sunday: the grid now shows weekend days in weeks that have anything then (and always, if the user wants).
-- The function is unchanged otherwise; CREATE OR REPLACE keeps its grants.
BEGIN;
CREATE OR REPLACE FUNCTION public.validate_schedule_patch(p_event jsonb,p_action text,p_patch jsonb,p_reason text)
RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE k text; v jsonb; d date; start_at time; duration integer;
BEGIN
  IF p_action IS NULL OR p_action NOT IN ('modify','cancel') OR p_patch IS NULL OR jsonb_typeof(p_patch)<>'object'
     OR length(p_reason)>1000 THEN RAISE EXCEPTION 'INVALID_CHANGE' USING ERRCODE='22023'; END IF;
  IF (p_action='cancel' AND p_patch<>'{}') OR (p_action='modify' AND p_patch='{}') THEN
    RAISE EXCEPTION 'INVALID_PATCH' USING ERRCODE='22023';
  END IF;
  FOR k,v IN SELECT * FROM jsonb_each(p_patch) LOOP
    IF k IN ('room','instructor') THEN
      IF v<>'null'::jsonb AND (jsonb_typeof(v)<>'string' OR length(p_patch->>k)>256) THEN
        RAISE EXCEPTION 'INVALID_TEXT' USING ERRCODE='22023'; END IF;
    ELSIF k='date' THEN
      IF jsonb_typeof(v)<>'string' OR (p_patch->>k)!~'^\d{4}-\d{2}-\d{2}$' THEN
        RAISE EXCEPTION 'INVALID_DATE' USING ERRCODE='22023'; END IF;
      d := (p_patch->>k)::date;
      IF to_char(d,'YYYY-MM-DD')<>p_patch->>k THEN
        RAISE EXCEPTION 'INVALID_DATE' USING ERRCODE='22023'; END IF;
    ELSIF k='start_time' THEN
      IF jsonb_typeof(v)<>'string' OR (p_patch->>k)!~'^([01][0-9]|2[0-3]):[0-5][0-9]:00$' THEN
        RAISE EXCEPTION 'INVALID_TIME' USING ERRCODE='22023'; END IF;
    ELSIF k='duration_min' THEN
      IF jsonb_typeof(v)<>'number' OR (v::text)::numeric <> trunc((v::text)::numeric)
        OR (v::text)::numeric NOT BETWEEN 1 AND 900 THEN
        RAISE EXCEPTION 'INVALID_DURATION' USING ERRCODE='22023'; END IF;
    ELSE RAISE EXCEPTION 'UNKNOWN_PATCH_FIELD' USING ERRCODE='22023'; END IF;
  END LOOP;
  IF p_patch ?| ARRAY['date','start_time','duration_min'] THEN
    start_at := (CASE WHEN p_patch?'start_time' THEN p_patch->>'start_time' ELSE p_event->>'start_time' END)::time;
    duration := (CASE WHEN p_patch?'duration_min' THEN p_patch->>'duration_min' ELSE p_event->>'duration_min' END)::numeric;
    IF start_at<'07:00'::time OR start_at>='22:00'::time OR duration<1 OR duration>900
       OR extract(epoch FROM start_at)/60+duration>1320 THEN
      RAISE EXCEPTION 'OUTSIDE_SCHEDULE_HOURS' USING ERRCODE='22023'; END IF;
  END IF;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
