-- STAGING FIRST. Requires 20261015_personal_overrides.sql and 20261026_conflicts_without_retry.sql.
-- A private change of a whole series ("ten i następne", "wszystkie") is one change per occurrence. They are
-- written together or not at all, each through the same preview and confirmation as a single change, so the
-- same checks apply (class still as shown, override unchanged, patch valid). Each occurrence gets its own
-- consumed preview under "<session>:<n>", which makes the request idempotent and gives undo the earlier state.
BEGIN;
CREATE FUNCTION public.apply_schedule_changes(p_user_id uuid, p_changes jsonb, p_session_id text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE change jsonb; proposal jsonb; session text; n integer := 0; result jsonb := '[]';
BEGIN
  IF p_user_id IS NULL OR jsonb_typeof(p_changes) IS DISTINCT FROM 'array' OR jsonb_array_length(p_changes) NOT BETWEEN 1 AND 40
     OR coalesce(length(p_session_id), 0) NOT BETWEEN 1 AND 120
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_changes) AS e WHERE jsonb_typeof(e.value) <> 'object') THEN
    RAISE EXCEPTION 'INVALID_CHANGES' USING ERRCODE='22023'; END IF;
  IF (SELECT count(DISTINCT e.value->>'event_id') FROM jsonb_array_elements(p_changes) AS e) <> jsonb_array_length(p_changes) THEN
    RAISE EXCEPTION 'DUPLICATE_EVENT' USING ERRCODE='22023'; END IF;
  -- One lock order for every batch, so two batches over the same classes cannot deadlock.
  FOR change IN SELECT e.value FROM jsonb_array_elements(p_changes) AS e ORDER BY e.value->>'event_id' LOOP
    n := n + 1;
    session := p_session_id || ':' || n;
    proposal := public.propose_schedule_change(p_user_id, (change->>'event_id')::uuid, change->>'operation',
      change->>'action', coalesce(change->'patch', '{}'::jsonb), change->>'reason', 'manual', session);
    result := result || jsonb_build_array(jsonb_build_object('event_id', proposal->>'event_id',
      'expected_override', proposal->'expected_override',
      'result', public.confirm_schedule_change(p_user_id, (proposal->>'id')::uuid, 'manual', session)));
  END LOOP;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.apply_schedule_changes(uuid,jsonb,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_schedule_changes(uuid,jsonb,text) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
