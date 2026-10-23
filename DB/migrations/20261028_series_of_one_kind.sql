-- STAGING FIRST. Requires 20261026_conflicts_without_retry.sql. Several new entries saved in one call formed a
-- series even when they were unrelated (e.g. an agent proposing a kolokwium and a report deadline). They now
-- form a series only when they share scope, kind and subject (taken from the class for entries pinned to one).
-- The function is unchanged otherwise; CREATE OR REPLACE keeps its grants.
BEGIN;
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
  -- New entries saved together are a series only when they are the same kind of thing for the same subject.
  IF (SELECT count(*) > 1 AND count(DISTINCT jsonb_build_array(e.value->>'scope', e.value->>'kind',
        coalesce(e.value->>'subject', (SELECT subject FROM public.events WHERE id = (e.value->>'event_id')::uuid)))) = 1
      FROM jsonb_array_elements(p_items) AS e WHERE NOT e.value ? 'id' AND e.value->'series_id' IS NULL) THEN
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
NOTIFY pgrst, 'reload schema';
COMMIT;
