-- STAGING FIRST. Owner-scoped links that let an external calendar (Odysseus)
-- mirror one user's effective plan. Only hashes of codes and tokens are stored.
BEGIN;
CREATE TABLE public.calendar_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  label text NOT NULL CHECK (length(label) BETWEEN 1 AND 80),
  faculty text NOT NULL CHECK (length(faculty) BETWEEN 1 AND 256),
  group_set_id text NOT NULL CHECK (length(group_set_id) BETWEEN 1 AND 128),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX calendar_links_user_idx ON public.calendar_links(user_id);
CREATE TABLE public.calendar_link_codes (
  code_hash text PRIMARY KEY CHECK (code_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (length(label) BETWEEN 1 AND 80),
  faculty text NOT NULL CHECK (length(faculty) BETWEEN 1 AND 256),
  group_set_id text NOT NULL CHECK (length(group_set_id) BETWEEN 1 AND 128),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at timestamptz,
  link_id uuid REFERENCES public.calendar_links(id) ON DELETE CASCADE
);
CREATE INDEX calendar_link_codes_user_idx ON public.calendar_link_codes(user_id,expires_at);
ALTER TABLE public.calendar_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_link_codes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_links, public.calendar_link_codes FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.calendar_links, public.calendar_link_codes TO service_role;

CREATE FUNCTION public.create_calendar_link_code(p_user_id uuid,p_code_hash text,p_label text,p_faculty text,p_group_set_id text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE saved public.calendar_link_codes;
BEGIN
  DELETE FROM public.calendar_link_codes WHERE user_id=p_user_id AND expires_at<now()-interval '1 day';
  IF (SELECT count(*) FROM public.calendar_link_codes WHERE user_id=p_user_id AND expires_at>now() AND consumed_at IS NULL)>=5 THEN
    RAISE EXCEPTION 'TOO_MANY_CODES' USING ERRCODE='54000'; END IF;
  IF (SELECT count(*) FROM public.calendar_links WHERE user_id=p_user_id AND revoked_at IS NULL
      AND last_used_at>now()-interval '180 days')>=5 THEN
    RAISE EXCEPTION 'TOO_MANY_LINKS' USING ERRCODE='54000'; END IF;
  INSERT INTO public.calendar_link_codes(code_hash,user_id,label,faculty,group_set_id)
    VALUES(p_code_hash,p_user_id,p_label,p_faculty,p_group_set_id) RETURNING * INTO saved;
  RETURN jsonb_build_object('expires_at',saved.expires_at);
END $$;

-- One-time exchange: the code is consumed and the link created atomically.
CREATE FUNCTION public.pair_calendar_link(p_code_hash text,p_token_hash text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE code public.calendar_link_codes; link public.calendar_links;
BEGIN
  SELECT * INTO code FROM public.calendar_link_codes WHERE code_hash=p_code_hash FOR UPDATE;
  IF NOT FOUND OR code.consumed_at IS NOT NULL OR code.expires_at<now() THEN
    RAISE EXCEPTION 'CODE_INVALID' USING ERRCODE='P0002'; END IF;
  INSERT INTO public.calendar_links(user_id,token_hash,label,faculty,group_set_id)
    VALUES(code.user_id,p_token_hash,code.label,code.faculty,code.group_set_id) RETURNING * INTO link;
  UPDATE public.calendar_link_codes SET consumed_at=now(),link_id=link.id WHERE code_hash=p_code_hash;
  RETURN jsonb_build_object('id',link.id,'label',link.label,'faculty',link.faculty,'group_set_id',link.group_set_id);
END $$;

-- Links expire after 180 days without use; every successful use extends them.
CREATE FUNCTION public.use_calendar_link(p_token_hash text)
RETURNS jsonb LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE link public.calendar_links; uid text;
BEGIN
  UPDATE public.calendar_links SET last_used_at=now()
    WHERE token_hash=p_token_hash AND revoked_at IS NULL AND last_used_at>now()-interval '180 days'
    RETURNING * INTO link;
  IF NOT FOUND THEN RAISE EXCEPTION 'LINK_INVALID' USING ERRCODE='P0002'; END IF;
  SELECT firebase_uid INTO uid FROM public.users WHERE id=link.user_id;
  RETURN jsonb_build_object('id',link.id,'user_id',link.user_id,'firebase_uid',uid,'label',link.label,
    'faculty',link.faculty,'group_set_id',link.group_set_id);
END $$;

REVOKE ALL ON FUNCTION public.create_calendar_link_code(uuid,text,text,text,text),
  public.pair_calendar_link(text,text),public.use_calendar_link(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_calendar_link_code(uuid,text,text,text,text),
  public.pair_calendar_link(text,text),public.use_calendar_link(text) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
