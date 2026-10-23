BEGIN;
-- Trusted Firebase API is the only writer. Neither agent nor browser gets this role.
CREATE TABLE public.schedule_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'personal' CHECK (scope = 'personal'),
  action text NOT NULL CHECK (action IN ('modify','cancel')),
  patch jsonb NOT NULL DEFAULT '{}', reason text CHECK (length(reason) <= 1000),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id,event_id)
);
CREATE INDEX schedule_overrides_event_idx ON public.schedule_overrides(event_id);
CREATE TABLE public.schedule_change_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  operation text NOT NULL CHECK (operation IN ('upsert','delete')),
  action text, patch jsonb NOT NULL, reason text,
  expected_event jsonb NOT NULL, expected_override jsonb,
  provider text NOT NULL CHECK (provider IN ('manual','n8n','odysseus')),
  session_id text NOT NULL CHECK (length(session_id) BETWEEN 1 AND 128),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at timestamptz, result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX schedule_proposals_user_idx ON public.schedule_change_proposals(user_id,expires_at);
ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_change_proposals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.schedule_overrides, public.schedule_change_proposals FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.schedule_overrides, public.schedule_change_proposals TO service_role;

CREATE FUNCTION public.validate_schedule_patch(p_event jsonb,p_action text,p_patch jsonb,p_reason text)
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
      IF to_char(d,'YYYY-MM-DD')<>p_patch->>k OR extract(isodow FROM d)>5 THEN
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

CREATE FUNCTION public.guard_schedule_override() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE source jsonb;
BEGIN
  SELECT to_jsonb(e) INTO source FROM public.events e WHERE e.id=NEW.event_id;
  IF source IS NULL OR source->>'source_system' IS NULL OR source->>'source_key' IS NULL THEN
    RAISE EXCEPTION 'SOURCE_IDENTITY_REQUIRED' USING ERRCODE='22023'; END IF;
  PERFORM public.validate_schedule_patch(source,NEW.action,NEW.patch,NEW.reason);
  IF TG_OP='UPDATE' THEN
    IF (NEW.id,NEW.event_id,NEW.user_id,NEW.scope,NEW.created_at) IS DISTINCT FROM
       (OLD.id,OLD.event_id,OLD.user_id,OLD.scope,OLD.created_at) THEN
      RAISE EXCEPTION 'IMMUTABLE_OVERRIDE_IDENTITY' USING ERRCODE='22023'; END IF;
    NEW.revision := OLD.revision+1;
  ELSE NEW.revision := 1; END IF;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_schedule_override BEFORE INSERT OR UPDATE ON public.schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION public.guard_schedule_override();

CREATE FUNCTION public.propose_schedule_change(p_user_id uuid,p_event_id uuid,p_operation text,
  p_action text,p_patch jsonb,p_reason text,p_provider text,p_session_id text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE source jsonb; previous jsonb; proposal public.schedule_change_proposals;
BEGIN
  -- Same lock ordering as confirmation and importer: source before personal row.
  SELECT to_jsonb(e) INTO source FROM public.events e WHERE e.id=p_event_id FOR SHARE;
  IF source IS NULL THEN RAISE EXCEPTION 'EVENT_NOT_FOUND' USING ERRCODE='P0002'; END IF;
  IF source->>'source_system' IS NULL OR source->>'source_key' IS NULL THEN
    RAISE EXCEPTION 'SOURCE_IDENTITY_REQUIRED' USING ERRCODE='22023'; END IF;
  SELECT to_jsonb(o) INTO previous FROM public.schedule_overrides o
    WHERE user_id=p_user_id AND event_id=p_event_id FOR SHARE;
  IF p_operation='upsert' THEN
    IF coalesce(source->>'status','aktywne') NOT IN ('aktywne','wolne') THEN
      RAISE EXCEPTION 'INACTIVE_SOURCE' USING ERRCODE='22023'; END IF;
    PERFORM public.validate_schedule_patch(source,p_action,p_patch,p_reason);
  ELSIF p_operation='delete' THEN
    IF previous IS NULL THEN RAISE EXCEPTION 'OVERRIDE_NOT_FOUND' USING ERRCODE='P0002'; END IF;
    IF p_action IS NOT NULL OR p_patch<>'{}' OR p_reason IS NOT NULL THEN
      RAISE EXCEPTION 'INVALID_DELETE' USING ERRCODE='22023'; END IF;
  ELSE RAISE EXCEPTION 'INVALID_OPERATION' USING ERRCODE='22023'; END IF;
  -- Expired/replayed previews are not an audit history; keep only a short retry window.
  DELETE FROM public.schedule_change_proposals WHERE user_id=p_user_id AND expires_at<now()-interval '1 day';
  IF (SELECT count(*) FROM public.schedule_change_proposals WHERE user_id=p_user_id AND expires_at>now() AND consumed_at IS NULL)>=50 THEN
    RAISE EXCEPTION 'TOO_MANY_PROPOSALS' USING ERRCODE='54000'; END IF;
  INSERT INTO public.schedule_change_proposals(user_id,event_id,operation,action,patch,reason,
    expected_event,expected_override,provider,session_id)
  VALUES(p_user_id,p_event_id,p_operation,p_action,p_patch,p_reason,source,previous,p_provider,p_session_id)
  RETURNING * INTO proposal;
  RETURN to_jsonb(proposal)-'user_id';
END $$;

CREATE FUNCTION public.confirm_schedule_change(p_user_id uuid,p_proposal_id uuid,p_provider text,p_session_id text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE proposal public.schedule_change_proposals; source jsonb; previous jsonb; saved jsonb; change_result jsonb;
BEGIN
  SELECT * INTO proposal FROM public.schedule_change_proposals
    WHERE id=p_proposal_id AND user_id=p_user_id FOR UPDATE;
  IF NOT FOUND OR proposal.provider<>p_provider OR proposal.session_id<>p_session_id THEN
    RAISE EXCEPTION 'PROPOSAL_NOT_FOUND' USING ERRCODE='P0002'; END IF;
  IF proposal.consumed_at IS NOT NULL THEN RETURN proposal.result; END IF;
  IF proposal.expires_at<now() THEN RAISE EXCEPTION 'PROPOSAL_EXPIRED' USING ERRCODE='40001'; END IF;
  SELECT to_jsonb(e) INTO source FROM public.events e WHERE e.id=proposal.event_id FOR UPDATE;
  SELECT to_jsonb(o) INTO previous FROM public.schedule_overrides o
    WHERE user_id=p_user_id AND event_id=proposal.event_id FOR UPDATE;
  IF source IS DISTINCT FROM proposal.expected_event OR previous IS DISTINCT FROM proposal.expected_override THEN
    RAISE EXCEPTION 'PLAN_CHANGED' USING ERRCODE='40001'; END IF;
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
REVOKE ALL ON FUNCTION public.validate_schedule_patch(jsonb,text,jsonb,text),public.guard_schedule_override(),
  public.propose_schedule_change(uuid,uuid,text,text,jsonb,text,text,text),
  public.confirm_schedule_change(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.validate_schedule_patch(jsonb,text,jsonb,text),public.guard_schedule_override(),
  public.propose_schedule_change(uuid,uuid,text,text,jsonb,text,text,text),
  public.confirm_schedule_change(uuid,uuid,text,text) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
