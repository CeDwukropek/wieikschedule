-- STAGING FIRST. Requires 20261014–20261024. Additive: new tables, functions and triggers only.
-- Group and private plan entries (kolokwia, report deadlines, …) and the roles that may write group
-- entries. Only the trusted API (service_role) calls these functions, passing the verified user.
BEGIN;

-- 1. Roles. Admin is global; one starosta per plan (faculty) and one starosta per group of a plan.
-- Groups chosen in the app's settings never grant anything: write access comes only from these rows.
CREATE TABLE public.plan_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','starosta','group_starosta')),
  faculty text CHECK (length(faculty) BETWEEN 1 AND 256),
  "group" text CHECK (length("group") BETWEEN 1 AND 128),
  granted_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  carried_from text CHECK (length(carried_from) BETWEEN 1 AND 1024),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((role = 'admin' AND faculty IS NULL AND "group" IS NULL)
      OR (role = 'starosta' AND faculty IS NOT NULL AND "group" IS NULL)
      OR (role = 'group_starosta' AND faculty IS NOT NULL AND "group" IS NOT NULL))
);
CREATE UNIQUE INDEX plan_roles_admin_key ON public.plan_roles (user_id) WHERE role = 'admin';
CREATE UNIQUE INDEX plan_roles_starosta_key ON public.plan_roles (faculty) WHERE role = 'starosta';
CREATE UNIQUE INDEX plan_roles_group_key ON public.plan_roles (faculty, "group") WHERE role = 'group_starosta';
CREATE INDEX plan_roles_user_idx ON public.plan_roles (user_id);

-- Roles are granted by one-time codes; only hashes are stored, as for calendar pairing.
CREATE TABLE public.plan_role_invites (
  code_hash text PRIMARY KEY CHECK (code_hash ~ '^[0-9a-f]{64}$'),
  role text NOT NULL CHECK (role IN ('starosta','group_starosta')),
  faculty text NOT NULL CHECK (length(faculty) BETWEEN 1 AND 256),
  "group" text CHECK (length("group") BETWEEN 1 AND 128),
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((role = 'starosta') = ("group" IS NULL))
);
CREATE INDEX plan_role_invites_creator_idx ON public.plan_role_invites (created_by, expires_at);

-- 2. Entries. "class" entries follow one class occurrence and copy its time; "slot" entries have their
-- own time; "due" entries are a day (optionally an hour). A group entry with no group concerns every
-- group of the subject. The import never deletes events, so RESTRICT only stops the one-time fresh load.
CREATE TABLE public.plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('group','personal')),
  owner_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  faculty text NOT NULL CHECK (length(faculty) BETWEEN 1 AND 256),
  subject text CHECK (length(subject) BETWEEN 1 AND 512),
  class_type text CHECK (length(class_type) BETWEEN 1 AND 256),
  "group" text CHECK (length("group") BETWEEN 1 AND 128),
  kind text NOT NULL CHECK (kind IN ('kolokwium','wejsciowka','sprawozdanie','egzamin','poprawa','projekt','inne')),
  timing text NOT NULL CHECK (timing IN ('class','slot','due')),
  event_id uuid REFERENCES public.events(id) ON DELETE RESTRICT,
  anchor jsonb,
  date date NOT NULL,
  start_time time,
  duration_min integer,
  due_time time,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  details text CHECK (length(details) <= 4000),
  series_id uuid,
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','review')),
  review_reason text CHECK (review_reason IN ('moved','cancelled','changed')),
  author_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CHECK ((scope = 'personal') = (owner_id IS NOT NULL)),
  CHECK (scope = 'personal' OR subject IS NOT NULL),
  CHECK ((state = 'review') = (review_reason IS NOT NULL)),
  CHECK (CASE timing
    WHEN 'class' THEN event_id IS NOT NULL AND anchor IS NOT NULL AND start_time IS NOT NULL
      AND duration_min IS NOT NULL AND due_time IS NULL
    WHEN 'slot' THEN event_id IS NULL AND anchor IS NULL AND start_time IS NOT NULL
      AND duration_min BETWEEN 5 AND 900 AND due_time IS NULL AND state = 'active'
    ELSE event_id IS NULL AND anchor IS NULL AND start_time IS NULL AND duration_min IS NULL AND state = 'active' END)
);
CREATE INDEX plan_items_event_idx ON public.plan_items (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX plan_items_group_date_idx ON public.plan_items (faculty, date) WHERE scope = 'group' AND deleted_at IS NULL;
CREATE INDEX plan_items_owner_date_idx ON public.plan_items (owner_id, date) WHERE owner_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX plan_items_series_idx ON public.plan_items (series_id) WHERE series_id IS NOT NULL;
CREATE INDEX plan_items_deleted_idx ON public.plan_items (deleted_at) WHERE deleted_at IS NOT NULL;
-- The same entry cannot be written twice (double clicks, retried agent previews). Class entries are keyed by
-- the occurrence, whose identity survives imports, so a moved class can never make the import collide.
CREATE UNIQUE INDEX plan_items_class_key ON public.plan_items
  (event_id, kind, coalesce(owner_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE timing = 'class' AND deleted_at IS NULL;
CREATE UNIQUE INDEX plan_items_dated_key ON public.plan_items
  (faculty, coalesce(subject, ''), coalesce("group", ''), kind, date, coalesce(start_time, due_time, '00:00'::time),
   coalesce(owner_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE timing <> 'class' AND deleted_at IS NULL;

-- Every revision of a group entry, for its history and for undo.
CREATE TABLE public.plan_item_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  operation text NOT NULL CHECK (operation IN ('create','update','delete','restore','review')),
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  item jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX plan_item_history_item_idx ON public.plan_item_history (item_id, revision);

-- Per-student view of any visible entry: hidden, progress and a private note.
CREATE TABLE public.plan_item_state (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE,
  hidden boolean NOT NULL DEFAULT false,
  progress text NOT NULL DEFAULT 'todo' CHECK (progress IN ('todo','ready','done')),
  note text CHECK (length(note) <= 2000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);
CREATE INDEX plan_item_state_item_idx ON public.plan_item_state (item_id);

ALTER TABLE public.plan_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_role_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_item_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_item_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.plan_roles, public.plan_role_invites, public.plan_items, public.plan_item_history,
  public.plan_item_state FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_roles, public.plan_role_invites, public.plan_items,
  public.plan_item_history, public.plan_item_state TO service_role;

-- Colours of every entry kind, next to the three system tags that already exist.
INSERT INTO public.tag_definitions (scope, key, label, color_hex)
SELECT 'system', kind.key, kind.label, kind.color FROM (VALUES
  ('kolokwium', 'Kolokwium', '#EF4444'), ('sprawozdanie', 'Sprawozdanie', '#3B82F6'),
  ('wejsciowka', 'Wejściówka', '#F59E0B'), ('egzamin', 'Egzamin', '#A855F7'),
  ('poprawa', 'Poprawa', '#EC4899'), ('projekt', 'Projekt', '#10B981'), ('inne', 'Inne', '#6B7280')
) AS kind(key, label, color)
WHERE NOT EXISTS (SELECT 1 FROM public.tag_definitions AS tag WHERE tag.scope = 'system' AND tag.key = kind.key);

-- 3. Permissions.
CREATE FUNCTION public.plan_can_write(p_user uuid, p_faculty text, p_group text)
RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM public.plan_roles AS r WHERE r.user_id = p_user AND (r.role = 'admin'
    OR (r.role = 'starosta' AND r.faculty = p_faculty)
    OR (r.role = 'group_starosta' AND r.faculty = p_faculty AND r."group" = p_group)))
$$;
CREATE FUNCTION public.plan_item_writable(p_user uuid, p_item public.plan_items)
RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
  SELECT CASE p_item.scope WHEN 'personal' THEN p_item.owner_id = p_user
    ELSE public.plan_can_write(p_user, p_item.faculty, p_item."group") END
$$;
-- Starostas are granted by an admin; group starostas by an admin or the plan's starosta.
CREATE FUNCTION public.plan_role_can_grant(p_user uuid, p_role text, p_faculty text)
RETURNS boolean LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM public.plan_roles AS r WHERE r.user_id = p_user AND (r.role = 'admin'
    OR (p_role = 'group_starosta' AND r.role = 'starosta' AND r.faculty = p_faculty)))
$$;

-- 4. Entry rules. The class an entry follows supplies its plan, subject, group and time.
CREATE FUNCTION public.plan_item_anchor(e public.events)
RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
  SELECT jsonb_build_object('date', e.date, 'start_time', e.start_time, 'duration_min', e.duration_min,
    'status', coalesce(e.status, 'aktywne'), 'faculty', e.faculty, 'subject', e.subject,
    'group', nullif(e."group", ''), 'type', nullif(e.type, ''))
$$;

CREATE FUNCTION public.guard_plan_item() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE source public.events;
BEGIN
  -- The author may only disappear (account deleted); nothing else about who and where changes.
  IF TG_OP = 'UPDATE' AND ((NEW.id, NEW.scope, NEW.owner_id, NEW.created_at) IS DISTINCT FROM
     (OLD.id, OLD.scope, OLD.owner_id, OLD.created_at) OR (NEW.author_id IS NOT NULL AND NEW.author_id IS DISTINCT FROM OLD.author_id)) THEN
    RAISE EXCEPTION 'IMMUTABLE_PLAN_ITEM' USING ERRCODE='22023'; END IF;
  NEW.title := btrim(NEW.title);
  NEW.details := nullif(btrim(NEW.details), '');
  IF NEW.timing = 'class' THEN
    SELECT * INTO source FROM public.events WHERE id = NEW.event_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE='P0002'; END IF;
    IF source.source_system IS NULL THEN RAISE EXCEPTION 'SOURCE_IDENTITY_REQUIRED' USING ERRCODE='22023'; END IF;
    IF (TG_OP = 'INSERT' OR NEW.event_id IS DISTINCT FROM OLD.event_id OR OLD.timing <> 'class')
       AND coalesce(source.status, 'aktywne') <> 'aktywne' THEN
      RAISE EXCEPTION 'INACTIVE_SOURCE' USING ERRCODE='22023'; END IF;
    NEW.faculty := coalesce(source.faculty, NEW.faculty); NEW.subject := source.subject;
    NEW.class_type := nullif(source.type, ''); NEW."group" := nullif(source."group", '');
    NEW.date := source.date; NEW.start_time := source.start_time; NEW.duration_min := source.duration_min;
    NEW.due_time := NULL;
    -- A confirmed entry remembers the class as it was; a moved class keeps the old copy until reviewed.
    IF NEW.state = 'active' THEN NEW.anchor := public.plan_item_anchor(source); NEW.review_reason := NULL; END IF;
  ELSE
    NEW.event_id := NULL; NEW.anchor := NULL; NEW.state := 'active'; NEW.review_reason := NULL;
    NEW.subject := nullif(btrim(NEW.subject), ''); NEW."group" := nullif(btrim(NEW."group"), '');
    NEW.class_type := nullif(btrim(NEW.class_type), '');
    IF NEW.timing = 'slot' AND (NEW.start_time < '07:00' OR NEW.start_time >= '22:00'
       OR extract(epoch FROM NEW.start_time) / 60 + NEW.duration_min > 1320) THEN
      RAISE EXCEPTION 'OUTSIDE_SCHEDULE_HOURS' USING ERRCODE='22023'; END IF;
    IF (TG_OP = 'INSERT' OR NEW.date IS DISTINCT FROM OLD.date)
       AND NEW.date NOT BETWEEN current_date - 366 AND current_date + 731 THEN
      RAISE EXCEPTION 'INVALID_DATE' USING ERRCODE='22023'; END IF;
  END IF;
  -- A write that changes nothing (repeated save, deleted account of the author) keeps the revision.
  IF TG_OP = 'UPDATE' AND (to_jsonb(NEW) - 'author_id' - 'updated_by' - 'revision' - 'updated_at')
     = (to_jsonb(OLD) - 'author_id' - 'updated_by' - 'revision' - 'updated_at') THEN
    NEW.revision := OLD.revision; NEW.updated_at := OLD.updated_at; RETURN NEW; END IF;
  NEW.revision := CASE WHEN TG_OP = 'UPDATE' THEN OLD.revision + 1 ELSE 1 END;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_plan_item BEFORE INSERT OR UPDATE ON public.plan_items
  FOR EACH ROW EXECUTE FUNCTION public.guard_plan_item();

CREATE FUNCTION public.record_plan_item_history() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  INSERT INTO public.plan_item_history (item_id, revision, operation, actor_id, item)
  VALUES (NEW.id, NEW.revision, CASE
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN 'delete'
      WHEN NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN 'restore'
      WHEN NEW.updated_by IS NULL THEN 'review'
      ELSE 'update' END,
    NEW.updated_by, to_jsonb(NEW) - 'owner_id' - 'author_id' - 'updated_by');
  RETURN NULL;
END $$;
CREATE TRIGGER record_plan_item_history_insert AFTER INSERT ON public.plan_items
  FOR EACH ROW WHEN (NEW.scope = 'group') EXECUTE FUNCTION public.record_plan_item_history();
CREATE TRIGGER record_plan_item_history_update AFTER UPDATE ON public.plan_items
  FOR EACH ROW WHEN (NEW.scope = 'group' AND NEW.revision <> OLD.revision) EXECUTE FUNCTION public.record_plan_item_history();

-- 5. The import moves or cancels a class: its entries follow it and wait for review, and return to normal
-- when the class is back as it was confirmed. Deleted entries are reviewed too, so undo restores them truthfully.
CREATE FUNCTION public.events_review_plan_items() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  UPDATE public.plan_items AS item SET
    state = CASE WHEN item.anchor = public.plan_item_anchor(new_row) THEN 'active' ELSE 'review' END,
    review_reason = CASE
      WHEN item.anchor = public.plan_item_anchor(new_row) THEN NULL
      WHEN coalesce(new_row.status, 'aktywne') <> 'aktywne' THEN 'cancelled'
      WHEN (new_row.date, new_row.start_time, new_row.duration_min) IS DISTINCT FROM
        ((item.anchor->>'date')::date, (item.anchor->>'start_time')::time, (item.anchor->>'duration_min')::integer) THEN 'moved'
      ELSE 'changed' END,
    updated_by = NULL
  FROM old_rows AS old_row JOIN new_rows AS new_row USING (id)
  WHERE item.event_id = new_row.id AND item.timing = 'class'
    AND public.plan_item_anchor(old_row) IS DISTINCT FROM public.plan_item_anchor(new_row);
  RETURN NULL;
END $$;
CREATE TRIGGER events_review_plan_items AFTER UPDATE ON public.events
  REFERENCING OLD TABLE AS old_rows NEW TABLE AS new_rows
  FOR EACH STATEMENT EXECUTE FUNCTION public.events_review_plan_items();

-- 6. Writing entries. Up to 20 entries per call; several new entries form one series unless they name an
-- existing series to extend. Updates need the revision the caller saw. Saving an entry under review confirms it.
CREATE FUNCTION public.save_plan_items(p_user uuid, p_items jsonb)
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
        RAISE EXCEPTION 'PLAN_ITEM_CHANGED' USING ERRCODE='40001'; END IF;
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

-- Deleting keeps the entry for 90 days so it can be restored (undo); p_restore brings deleted entries back.
CREATE FUNCTION public.remove_plan_items(p_user uuid, p_items jsonb, p_restore boolean DEFAULT false)
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
      RAISE EXCEPTION 'PLAN_ITEM_CHANGED' USING ERRCODE='40001'; END IF;
    UPDATE public.plan_items SET deleted_at = CASE WHEN p_restore THEN NULL ELSE now() END, updated_by = p_user
      WHERE id = current.id RETURNING * INTO saved;
    result := result || jsonb_build_array(jsonb_build_object('id', saved.id, 'revision', saved.revision));
  END LOOP;
  RETURN result;
END $$;

CREATE FUNCTION public.set_plan_item_state(p_user uuid, p_item uuid, p_state jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE saved public.plan_item_state;
BEGIN
  IF p_user IS NULL OR jsonb_typeof(p_state) IS DISTINCT FROM 'object' OR p_state = '{}'
     OR EXISTS (SELECT 1 FROM jsonb_object_keys(p_state) AS k WHERE k NOT IN ('hidden','progress','note')) THEN
    RAISE EXCEPTION 'INVALID_PLAN_ITEM_STATE' USING ERRCODE='22023'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.plan_items WHERE id = p_item AND deleted_at IS NULL
                 AND (scope = 'group' OR owner_id = p_user)) THEN
    RAISE EXCEPTION 'PLAN_ITEM_NOT_FOUND' USING ERRCODE='P0002'; END IF;
  INSERT INTO public.plan_item_state AS existing (user_id, item_id, hidden, progress, note)
  VALUES (p_user, p_item, coalesce((p_state->>'hidden')::boolean, false), coalesce(p_state->>'progress', 'todo'),
    nullif(btrim(p_state->>'note'), ''))
  ON CONFLICT (user_id, item_id) DO UPDATE SET
    hidden = CASE WHEN p_state ? 'hidden' THEN EXCLUDED.hidden ELSE existing.hidden END,
    progress = CASE WHEN p_state ? 'progress' THEN EXCLUDED.progress ELSE existing.progress END,
    note = CASE WHEN p_state ? 'note' THEN EXCLUDED.note ELSE existing.note END,
    updated_at = now()
  RETURNING * INTO saved;
  RETURN to_jsonb(saved) - 'user_id';
END $$;

-- 7. Granting roles.
CREATE FUNCTION public.create_plan_role_invite(p_user uuid, p_code_hash text, p_role text, p_faculty text, p_group text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE saved public.plan_role_invites;
BEGIN
  IF coalesce(p_role, '') NOT IN ('starosta','group_starosta') OR (p_role = 'starosta') <> (p_group IS NULL) THEN
    RAISE EXCEPTION 'INVALID_ROLE' USING ERRCODE='22023'; END IF;
  IF NOT public.plan_role_can_grant(p_user, p_role, p_faculty) THEN
    RAISE EXCEPTION 'ROLE_FORBIDDEN' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.timetable_versions WHERE faculty = p_faculty) OR (p_group IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.events WHERE faculty = p_faculty AND "group" = p_group)) THEN
    RAISE EXCEPTION 'UNKNOWN_FACULTY_OR_GROUP' USING ERRCODE='P0002'; END IF;
  IF (SELECT count(*) FROM public.plan_role_invites WHERE created_by = p_user AND used_at IS NULL AND expires_at > now()) >= 20 THEN
    RAISE EXCEPTION 'TOO_MANY_INVITES' USING ERRCODE='54000'; END IF;
  INSERT INTO public.plan_role_invites (code_hash, role, faculty, "group", created_by)
    VALUES (p_code_hash, p_role, p_faculty, p_group, p_user) RETURNING * INTO saved;
  RETURN jsonb_build_object('role', saved.role, 'faculty', saved.faculty, 'group', saved."group", 'expires_at', saved.expires_at);
END $$;

-- Redeeming replaces the previous holder of that place; an invite dies with its issuer's authority.
CREATE FUNCTION public.redeem_plan_role_invite(p_user uuid, p_code_hash text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE invite public.plan_role_invites; saved public.plan_roles; replaced integer;
BEGIN
  SELECT * INTO invite FROM public.plan_role_invites WHERE code_hash = p_code_hash FOR UPDATE;
  IF NOT FOUND OR invite.used_at IS NOT NULL OR invite.expires_at < now()
     OR NOT public.plan_role_can_grant(invite.created_by, invite.role, invite.faculty) THEN
    RAISE EXCEPTION 'INVITE_INVALID' USING ERRCODE='P0002'; END IF;
  DELETE FROM public.plan_roles WHERE role = invite.role AND faculty = invite.faculty
    AND "group" IS NOT DISTINCT FROM invite."group";
  GET DIAGNOSTICS replaced = ROW_COUNT;
  INSERT INTO public.plan_roles (user_id, role, faculty, "group", granted_by)
    VALUES (p_user, invite.role, invite.faculty, invite."group", invite.created_by) RETURNING * INTO saved;
  UPDATE public.plan_role_invites SET used_by = p_user, used_at = now() WHERE code_hash = p_code_hash;
  RETURN jsonb_build_object('id', saved.id, 'role', saved.role, 'faculty', saved.faculty, 'group', saved."group",
    'replaced', replaced > 0);
END $$;

-- A role can be given up by its holder or taken by whoever may grant it. Admins are managed in ops only.
CREATE FUNCTION public.revoke_plan_role(p_user uuid, p_role_id uuid)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE target public.plan_roles;
BEGIN
  SELECT * INTO target FROM public.plan_roles WHERE id = p_role_id FOR UPDATE;
  IF NOT FOUND OR target.role = 'admin'
     OR NOT (target.user_id = p_user OR public.plan_role_can_grant(p_user, target.role, target.faculty)) THEN
    RAISE EXCEPTION 'ROLE_NOT_FOUND' USING ERRCODE='P0002'; END IF;
  DELETE FROM public.plan_roles WHERE id = target.id;
  RETURN jsonb_build_object('id', target.id, 'role', target.role, 'faculty', target.faculty, 'group', target."group");
END $$;

-- A new semester of a plan (EiAs3 → EiAs4, EiAs6 → EiAs7A and EiAs7I) keeps its starosta; group starostas
-- are not carried over. Ambiguous predecessors (two different starostas) are left for an admin.
CREATE FUNCTION public.carry_over_starosta() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE parts text[]; holders uuid[]; sources text;
BEGIN
  parts := regexp_match(NEW.faculty, '^(.+)s([0-9]{1,2})([A-Za-z]?)$');
  IF parts IS NULL OR parts[2]::integer < 2
     OR EXISTS (SELECT 1 FROM public.plan_roles WHERE role = 'starosta' AND faculty = NEW.faculty) THEN
    RETURN NULL; END IF;
  SELECT array_agg(DISTINCT r.user_id), string_agg(DISTINCT r.faculty, ',') INTO holders, sources
  FROM public.plan_roles AS r, LATERAL regexp_match(r.faculty, '^(.+)s([0-9]{1,2})([A-Za-z]?)$') AS previous(m)
  WHERE r.role = 'starosta' AND previous.m IS NOT NULL AND previous.m[1] = parts[1]
    AND previous.m[2]::integer = parts[2]::integer - 1
    AND (previous.m[3] = parts[3] OR previous.m[3] = '' OR parts[3] = '');
  IF cardinality(holders) = 1 THEN
    INSERT INTO public.plan_roles (user_id, role, faculty, carried_from) VALUES (holders[1], 'starosta', NEW.faculty, sources);
  END IF;
  RETURN NULL;
END $$;
CREATE TRIGGER carry_over_starosta AFTER INSERT ON public.timetable_versions
  FOR EACH ROW EXECUTE FUNCTION public.carry_over_starosta();

-- 8. Deleted entries and dead invites are purged whenever new ones are written.
CREATE FUNCTION public.purge_plan_ephemera() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  DELETE FROM public.plan_items WHERE deleted_at < now() - interval '90 days';
  DELETE FROM public.plan_role_invites WHERE expires_at < now() - interval '30 days';
  RETURN NULL;
END $$;
CREATE TRIGGER purge_after_plan_item AFTER INSERT ON public.plan_items
  FOR EACH STATEMENT EXECUTE FUNCTION public.purge_plan_ephemera();
CREATE TRIGGER purge_after_role_invite AFTER INSERT ON public.plan_role_invites
  FOR EACH STATEMENT EXECUTE FUNCTION public.purge_plan_ephemera();

REVOKE ALL ON FUNCTION public.plan_can_write(uuid,text,text), public.plan_item_writable(uuid,public.plan_items),
  public.plan_role_can_grant(uuid,text,text), public.plan_item_anchor(public.events), public.guard_plan_item(),
  public.record_plan_item_history(), public.events_review_plan_items(), public.save_plan_items(uuid,jsonb),
  public.remove_plan_items(uuid,jsonb,boolean), public.set_plan_item_state(uuid,uuid,jsonb),
  public.create_plan_role_invite(uuid,text,text,text,text), public.redeem_plan_role_invite(uuid,text),
  public.revoke_plan_role(uuid,uuid), public.carry_over_starosta(), public.purge_plan_ephemera()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.plan_can_write(uuid,text,text), public.plan_item_writable(uuid,public.plan_items),
  public.plan_role_can_grant(uuid,text,text), public.plan_item_anchor(public.events), public.guard_plan_item(),
  public.save_plan_items(uuid,jsonb), public.remove_plan_items(uuid,jsonb,boolean),
  public.set_plan_item_state(uuid,uuid,jsonb), public.create_plan_role_invite(uuid,text,text,text,text),
  public.redeem_plan_role_invite(uuid,text), public.revoke_plan_role(uuid,uuid) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
