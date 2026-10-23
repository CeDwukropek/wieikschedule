-- STAGING FIRST. Requires 20261015_personal_overrides.sql and 20261025_plan_items_and_roles.sql.
-- PostgREST retries a transaction without limit when it fails with SQLSTATE 40001 (serialization_failure),
-- so a stale preview or entry made the request hang while the function ran thousands of times a second.
-- Conflicts the caller has to resolve use PT409 instead: PostgREST answers HTTP 409 and does not retry.
-- The function bodies are unchanged otherwise; CREATE OR REPLACE keeps their grants.
BEGIN;
CREATE OR REPLACE FUNCTION public.confirm_schedule_change(p_user_id uuid,p_proposal_id uuid,p_provider text,p_session_id text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE proposal public.schedule_change_proposals; source jsonb; previous jsonb; saved jsonb; change_result jsonb;
BEGIN
  SELECT * INTO proposal FROM public.schedule_change_proposals
    WHERE id=p_proposal_id AND user_id=p_user_id FOR UPDATE;
  IF NOT FOUND OR proposal.provider<>p_provider OR proposal.session_id<>p_session_id THEN
    RAISE EXCEPTION 'PROPOSAL_NOT_FOUND' USING ERRCODE='P0002'; END IF;
  IF proposal.consumed_at IS NOT NULL THEN RETURN proposal.result; END IF;
  IF proposal.expires_at<now() THEN RAISE EXCEPTION 'PROPOSAL_EXPIRED' USING ERRCODE='PT409'; END IF;
  SELECT to_jsonb(e) INTO source FROM public.events e WHERE e.id=proposal.event_id FOR UPDATE;
  SELECT to_jsonb(o) INTO previous FROM public.schedule_overrides o
    WHERE user_id=p_user_id AND event_id=proposal.event_id FOR UPDATE;
  IF source IS DISTINCT FROM proposal.expected_event OR previous IS DISTINCT FROM proposal.expected_override THEN
    RAISE EXCEPTION 'PLAN_CHANGED' USING ERRCODE='PT409'; END IF;
  IF proposal.operation='delete' THEN
    DELETE FROM public.schedule_overrides WHERE user_id=p_user_id AND event_id=proposal.event_id;
  ELSE
    INSERT INTO public.schedule_overrides(user_id,event_id,action,patch,reason)
      VALUES(p_user_id,proposal.event_id,proposal.action,proposal.patch,proposal.reason)
    ON CONFLICT(user_id,event_id) DO UPDATE SET action=EXCLUDED.action,patch=EXCLUDED.patch,reason=EXCLUDED.reason
    RETURNING to_jsonb(schedule_overrides) INTO saved;
  END IF;
  change_result := jsonb_build_object('event_id',proposal.event_id,'override',saved,'operation',proposal.operation);
  UPDATE public.schedule_change_proposals SET consumed_at=now(),result=change_result WHERE id=proposal.id;
  RETURN change_result;
END $$;

CREATE OR REPLACE FUNCTION public.save_plan_items(p_user uuid, p_items jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE
  entry jsonb; current public.plan_items; draft public.plan_items; saved public.plan_items;
  source public.events; new_series uuid; result jsonb := '[]'; touched uuid[] := '{}';
  allowed text[] := ARRAY['id','revision','scope','faculty','subject','class_type','group','kind','timing',
    'event_id','date','start_time','duration_min','due_time','title','details','series_id'];
BEGIN
  IF p_user IS NULL OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 20
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) AS e WHERE jsonb_typeof(e.value) <> 'object') THEN
    RAISE EXCEPTION 'INVALID_PLAN_ITEMS' USING ERRCODE='22023'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) AS e, jsonb_object_keys(e.value) AS k WHERE k <> ALL (allowed)) THEN
    RAISE EXCEPTION 'UNKNOWN_PLAN_ITEM_FIELD' USING ERRCODE='22023'; END IF;
  IF (SELECT count(*) FROM jsonb_array_elements(p_items) AS e WHERE NOT e.value ? 'id' AND e.value->'series_id' IS NULL) > 1 THEN
    new_series := gen_random_uuid(); END IF;
  FOR entry IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF entry ? 'id' THEN
      SELECT * INTO current FROM public.plan_items WHERE id = (entry->>'id')::uuid AND deleted_at IS NULL;
      IF NOT FOUND OR NOT public.plan_item_writable(p_user, current) THEN
        RAISE EXCEPTION 'PLAN_ITEM_NOT_FOUND' USING ERRCODE='P0002'; END IF;
      IF entry ? 'scope' AND entry->>'scope' IS DISTINCT FROM current.scope THEN
        RAISE EXCEPTION 'IMMUTABLE_PLAN_ITEM' USING ERRCODE='22023'; END IF;
      IF entry->'series_id' IS NOT NULL AND jsonb_typeof(entry->'series_id') <> 'null'
         AND (entry->>'series_id')::uuid IS DISTINCT FROM current.series_id THEN
        RAISE EXCEPTION 'INVALID_SERIES' USING ERRCODE='22023'; END IF;
      draft := jsonb_populate_record(current, entry - 'id' - 'revision' - 'scope');
    ELSE
      draft := jsonb_populate_record(NULL::public.plan_items, entry - 'revision');
      draft.id := gen_random_uuid(); draft.author_id := p_user; draft.created_at := now();
      draft.owner_id := CASE WHEN draft.scope = 'personal' THEN p_user END;
      draft.series_id := coalesce(draft.series_id, new_series);
      IF entry->'series_id' IS NOT NULL AND jsonb_typeof(entry->'series_id') <> 'null' AND NOT EXISTS (
          SELECT 1 FROM public.plan_items AS member WHERE member.series_id = draft.series_id AND member.deleted_at IS NULL
            AND member.scope = draft.scope AND member.owner_id IS NOT DISTINCT FROM draft.owner_id
            AND public.plan_item_writable(p_user, member)) THEN
        RAISE EXCEPTION 'SERIES_NOT_FOUND' USING ERRCODE='P0002'; END IF;
    END IF;
    -- The class goes first (same order as the importer), so a concurrent import waits for this entry.
    IF draft.timing = 'class' THEN
      SELECT * INTO source FROM public.events WHERE id = draft.event_id FOR SHARE;
      IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE='P0002'; END IF;
      draft.faculty := coalesce(source.faculty, draft.faculty); draft.subject := source.subject;
      draft."group" := nullif(source."group", '');
    ELSIF draft.scope = 'group' THEN
      IF NOT EXISTS (SELECT 1 FROM public.events WHERE faculty = draft.faculty AND subject = draft.subject
           AND (draft."group" IS NULL OR "group" = draft."group")) THEN
        RAISE EXCEPTION 'UNKNOWN_SUBJECT_OR_GROUP' USING ERRCODE='P0002'; END IF;
    END IF;
    IF NOT public.plan_item_writable(p_user, draft) THEN
      RAISE EXCEPTION 'PLAN_ITEM_FORBIDDEN' USING ERRCODE='42501'; END IF;
    draft.state := 'active'; draft.review_reason := NULL; draft.updated_by := p_user;
    IF entry ? 'id' THEN
      SELECT * INTO current FROM public.plan_items WHERE id = draft.id AND deleted_at IS NULL FOR UPDATE;
      IF NOT FOUND OR (entry->>'revision')::integer IS DISTINCT FROM current.revision THEN
        RAISE EXCEPTION 'PLAN_ITEM_CHANGED' USING ERRCODE='PT409'; END IF;
      UPDATE public.plan_items SET faculty = draft.faculty, subject = draft.subject, class_type = draft.class_type,
        "group" = draft."group", kind = draft.kind, timing = draft.timing, event_id = draft.event_id,
        date = draft.date, start_time = draft.start_time, duration_min = draft.duration_min,
        due_time = draft.due_time, title = draft.title, details = draft.details, series_id = draft.series_id,
        state = draft.state, review_reason = draft.review_reason, updated_by = draft.updated_by
      WHERE id = draft.id RETURNING * INTO saved;
    ELSE
      INSERT INTO public.plan_items SELECT (draft).* RETURNING * INTO saved;
    END IF;
    IF saved.series_id IS NOT NULL THEN touched := touched || saved.series_id; END IF;
    result := result || jsonb_build_array(to_jsonb(saved) - 'owner_id' - 'author_id' - 'updated_by');
  END LOOP;
  IF EXISTS (SELECT 1 FROM public.plan_items WHERE series_id = ANY (touched) AND deleted_at IS NULL
             GROUP BY series_id HAVING count(*) > 20) THEN
    RAISE EXCEPTION 'SERIES_TOO_LONG' USING ERRCODE='54000'; END IF;
  IF (SELECT count(*) FROM public.plan_items WHERE owner_id = p_user AND deleted_at IS NULL) > 1000 THEN
    RAISE EXCEPTION 'TOO_MANY_PLAN_ITEMS' USING ERRCODE='54000'; END IF;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.remove_plan_items(p_user uuid, p_items jsonb, p_restore boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE entry jsonb; current public.plan_items; saved public.plan_items; result jsonb := '[]';
BEGIN
  IF p_user IS NULL OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 50
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) AS e
       WHERE jsonb_typeof(e.value) <> 'object' OR NOT e.value ?& ARRAY['id','revision']
          OR (SELECT count(*) FROM jsonb_object_keys(e.value)) <> 2) THEN
    RAISE EXCEPTION 'INVALID_PLAN_ITEMS' USING ERRCODE='22023'; END IF;
  FOR entry IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO current FROM public.plan_items WHERE id = (entry->>'id')::uuid
      AND (deleted_at IS NOT NULL) = p_restore FOR UPDATE;
    IF NOT FOUND OR NOT public.plan_item_writable(p_user, current) THEN
      RAISE EXCEPTION 'PLAN_ITEM_NOT_FOUND' USING ERRCODE='P0002'; END IF;
    IF (entry->>'revision')::integer IS DISTINCT FROM current.revision THEN
      RAISE EXCEPTION 'PLAN_ITEM_CHANGED' USING ERRCODE='PT409'; END IF;
    UPDATE public.plan_items SET deleted_at = CASE WHEN p_restore THEN NULL ELSE now() END, updated_by = p_user
      WHERE id = current.id RETURNING * INTO saved;
    result := result || jsonb_build_array(jsonb_build_object('id', saved.id, 'revision', saved.revision));
  END LOOP;
  RETURN result;
END $$;
NOTIFY pgrst, 'reload schema';
COMMIT;
