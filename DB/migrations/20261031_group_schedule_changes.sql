-- STAGING FIRST. Requires 20261015_personal_overrides.sql, 20261025_plan_items_and_roles.sql and
-- 20261027_weekend_changes.sql. Only adds objects; no existing data changes.
-- A starosta's change of a class for everyone who has it: moved (date, hours), another room or instructor, or
-- cancelled. One change per class occurrence, shown to the whole group (guests too) on top of the university plan;
-- a person's own private change of the same class still wins in their plan. Written only by the trusted API
-- (service_role) through apply_group_schedule_changes, which checks the role (plan_can_write, as for group
-- entries) and the expected revision. The import never deletes events, so RESTRICT only stops the fresh load.
BEGIN;
CREATE TABLE public.group_schedule_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE RESTRICT,
  -- Copied from the class when written: the plan and group whose starostas may change it.
  faculty text NOT NULL CHECK (length(faculty) BETWEEN 1 AND 256),
  "group" text CHECK (length("group") BETWEEN 1 AND 128),
  action text NOT NULL CHECK (action IN ('modify','cancel')),
  patch jsonb NOT NULL DEFAULT '{}', reason text CHECK (length(reason) <= 1000),
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX group_schedule_overrides_faculty_idx ON public.group_schedule_overrides (faculty);
-- Who changed what and when; kept when a change is undone or the author's account is deleted.
CREATE TABLE public.group_schedule_override_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  faculty text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('upsert','delete')),
  previous jsonb, current jsonb,
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX group_schedule_override_history_event_idx ON public.group_schedule_override_history (event_id, created_at);
ALTER TABLE public.group_schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_schedule_override_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.group_schedule_overrides, public.group_schedule_override_history FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_schedule_overrides TO service_role;
GRANT SELECT, INSERT ON public.group_schedule_override_history TO service_role;

-- The same checks as a private change (fields, dates, 07:00–22:00), the plan and group taken from the class.
CREATE FUNCTION public.guard_group_schedule_override() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE source jsonb;
BEGIN
  SELECT to_jsonb(e) INTO source FROM public.events e WHERE e.id = NEW.event_id;
  IF source IS NULL OR source->>'source_system' IS NULL OR source->>'source_key' IS NULL THEN
    RAISE EXCEPTION 'SOURCE_IDENTITY_REQUIRED' USING ERRCODE='22023'; END IF;
  PERFORM public.validate_schedule_patch(source, NEW.action, NEW.patch, NEW.reason);
  NEW.faculty := source->>'faculty';
  NEW."group" := nullif(btrim(coalesce(source->>'group', '')), '');
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.id, NEW.event_id, NEW.created_at) IS DISTINCT FROM (OLD.id, OLD.event_id, OLD.created_at) THEN
      RAISE EXCEPTION 'IMMUTABLE_OVERRIDE_IDENTITY' USING ERRCODE='22023'; END IF;
    NEW.revision := OLD.revision + 1;
  ELSE NEW.revision := 1; END IF;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_group_schedule_override BEFORE INSERT OR UPDATE ON public.group_schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION public.guard_group_schedule_override();

-- Changes of one or more classes (a series), written together or not at all. Each change:
-- {event_id, operation: upsert|delete, action, patch, reason, revision}, where revision is the change the person
-- saw (null: none), so two starostas cannot overwrite each other unseen. Returns, per class, the change before and
-- after, for undo.
CREATE FUNCTION public.apply_group_schedule_changes(p_user uuid, p_changes jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE change jsonb; source public.events; previous public.group_schedule_overrides; saved public.group_schedule_overrides;
  result jsonb := '[]'; expected integer;
BEGIN
  IF p_user IS NULL OR jsonb_typeof(p_changes) IS DISTINCT FROM 'array' OR jsonb_array_length(p_changes) NOT BETWEEN 1 AND 40
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(p_changes) AS e WHERE jsonb_typeof(e.value) <> 'object') THEN
    RAISE EXCEPTION 'INVALID_CHANGES' USING ERRCODE='22023'; END IF;
  IF (SELECT count(DISTINCT e.value->>'event_id') FROM jsonb_array_elements(p_changes) AS e) <> jsonb_array_length(p_changes) THEN
    RAISE EXCEPTION 'DUPLICATE_EVENT' USING ERRCODE='22023'; END IF;
  -- One lock order for every batch (class, then its change), so two batches cannot deadlock.
  FOR change IN SELECT e.value FROM jsonb_array_elements(p_changes) AS e ORDER BY e.value->>'event_id' LOOP
    SELECT * INTO source FROM public.events WHERE id = (change->>'event_id')::uuid FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE='P0002'; END IF;
    IF NOT public.plan_can_write(p_user, source.faculty, nullif(btrim(coalesce(source."group", '')), '')) THEN
      RAISE EXCEPTION 'GROUP_CHANGE_FORBIDDEN' USING ERRCODE='42501'; END IF;
    SELECT * INTO previous FROM public.group_schedule_overrides WHERE event_id = source.id FOR UPDATE;
    expected := (change->>'revision')::integer;
    IF expected IS DISTINCT FROM previous.revision THEN
      RAISE EXCEPTION 'PLAN_CHANGED' USING ERRCODE='PT409'; END IF;
    saved := NULL;
    IF change->>'operation' = 'delete' THEN
      IF previous.id IS NULL THEN RAISE EXCEPTION 'OVERRIDE_NOT_FOUND' USING ERRCODE='P0002'; END IF;
      DELETE FROM public.group_schedule_overrides WHERE id = previous.id;
    ELSIF change->>'operation' = 'upsert' THEN
      IF coalesce(source.status, 'aktywne') NOT IN ('aktywne', 'wolne') THEN
        RAISE EXCEPTION 'INACTIVE_SOURCE' USING ERRCODE='22023'; END IF;
      INSERT INTO public.group_schedule_overrides (event_id, faculty, action, patch, reason, author_id)
        VALUES (source.id, source.faculty, change->>'action', coalesce(change->'patch', '{}'::jsonb), change->>'reason', p_user)
      ON CONFLICT (event_id) DO UPDATE SET action = EXCLUDED.action, patch = EXCLUDED.patch, reason = EXCLUDED.reason,
        author_id = EXCLUDED.author_id
      RETURNING * INTO saved;
    ELSE RAISE EXCEPTION 'INVALID_OPERATION' USING ERRCODE='22023'; END IF;
    INSERT INTO public.group_schedule_override_history (event_id, faculty, operation, previous, current, author_id)
      VALUES (source.id, source.faculty, change->>'operation',
        CASE WHEN previous.id IS NULL THEN NULL ELSE to_jsonb(previous) - 'author_id' END,
        CASE WHEN saved.id IS NULL THEN NULL ELSE to_jsonb(saved) - 'author_id' END, p_user);
    result := result || jsonb_build_array(jsonb_build_object('event_id', source.id,
      'previous', CASE WHEN previous.id IS NULL THEN NULL ELSE to_jsonb(previous) - 'author_id' END,
      'current', CASE WHEN saved.id IS NULL THEN NULL ELSE to_jsonb(saved) - 'author_id' END));
  END LOOP;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.guard_group_schedule_override(), public.apply_group_schedule_changes(uuid,jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_group_schedule_changes(uuid,jsonb) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
