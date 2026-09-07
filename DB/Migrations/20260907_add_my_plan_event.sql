-- Apply before deploying the updated /api/my-plan/add-event endpoint.
-- Uses the current schema; also supports the legacy schedule_name column.
BEGIN;

CREATE OR REPLACE FUNCTION public.add_my_plan_event(
  p_firebase_uid text,
  p_event_id uuid,
  p_schedule_name text,
  p_reason text DEFAULT 'makeup'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_faculty text;
  v_added public.user_added_events%ROWTYPE;
  v_already_added boolean := false;
BEGIN
  IF p_firebase_uid IS NULL OR btrim(p_firebase_uid) = '' OR
     p_event_id IS NULL OR p_schedule_name IS NULL OR btrim(p_schedule_name) = '' OR
     p_reason IS NULL OR p_reason NOT IN ('makeup', 'optional', 'manual') THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 400, 'error', 'BAD_REQUEST',
      'message', 'Niepoprawne dane wydarzenia.');
  END IF;

  SELECT e.faculty INTO v_faculty FROM public.events e
    WHERE e.id = p_event_id AND e.status = 'aktywne' FOR SHARE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 404, 'error', 'EVENT_NOT_FOUND',
      'message', 'Nie znaleziono aktywnego wydarzenia.');
  END IF;
  IF btrim(v_faculty) IS DISTINCT FROM btrim(p_schedule_name) THEN
    RETURN jsonb_build_object('ok', false, 'status_code', 400, 'error', 'EVENT_SCHEDULE_MISMATCH',
      'message', 'Ten event nie nalezy do aktualnie ogladanego planu.');
  END IF;

  -- Serialize concurrent adds by Firebase identity, including first-time users.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_firebase_uid, 0));
  SELECT u.id INTO v_user_id FROM public.users u WHERE u.firebase_uid = p_firebase_uid;
  IF v_user_id IS NULL THEN
    INSERT INTO public.users (firebase_uid) VALUES (p_firebase_uid)
      ON CONFLICT (firebase_uid) DO NOTHING;
    SELECT u.id INTO v_user_id FROM public.users u WHERE u.firebase_uid = p_firebase_uid;
  END IF;

  SELECT a.* INTO v_added FROM public.user_added_events a
    WHERE a.user_id = v_user_id AND a.event_id = p_event_id AND a.status = 'active'
    LIMIT 1;
  v_already_added := FOUND;
  IF NOT v_already_added THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_added_events' AND column_name = 'schedule_name') THEN
      EXECUTE 'INSERT INTO public.user_added_events (user_id, event_id, reason, status, schedule_name)
        VALUES ($1, $2, $3, ''active'', $4) ON CONFLICT DO NOTHING RETURNING *'
        INTO v_added USING v_user_id, p_event_id, p_reason, v_faculty;
    ELSE
      INSERT INTO public.user_added_events (user_id, event_id, reason, status)
        VALUES (v_user_id, p_event_id, p_reason, 'active')
        ON CONFLICT DO NOTHING RETURNING * INTO v_added;
    END IF;
    -- Handle writers outside this function using the unique active-link index.
    IF v_added.id IS NULL THEN
      SELECT a.* INTO STRICT v_added FROM public.user_added_events a
        WHERE a.user_id = v_user_id AND a.event_id = p_event_id AND a.status = 'active';
      v_already_added := true;
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'already_added', v_already_added,
    'added_event', jsonb_build_object('id', v_added.id, 'event_id', v_added.event_id,
      'status', v_added.status, 'reason', v_added.reason, 'created_at', v_added.created_at));
END;
$$;

REVOKE ALL ON FUNCTION public.add_my_plan_event(text, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_my_plan_event(text, uuid, text, text) TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
