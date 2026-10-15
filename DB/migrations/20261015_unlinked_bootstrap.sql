-- Apply after 20261014_wieik_import.sql, first on a disposable/restored database.
BEGIN;
CREATE FUNCTION public.bootstrap_wieik_import(p_expected jsonb, p_changes jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  has_overrides boolean;
BEGIN
  -- Prevent a concurrent addition/tag from invalidating the initial-state check.
  LOCK TABLE public.events, public.user_added_events, public.user_event_tags
    IN SHARE ROW EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.user_added_events) OR
     EXISTS (SELECT 1 FROM public.user_event_tags) THEN
    RAISE EXCEPTION 'Bootstrap refused: personal event data exists';
  END IF;
  IF to_regclass('public.schedule_overrides') IS NOT NULL THEN
    EXECUTE 'LOCK TABLE public.schedule_overrides IN SHARE ROW EXCLUSIVE MODE';
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.schedule_overrides)' INTO has_overrides;
    IF has_overrides THEN
      RAISE EXCEPTION 'Bootstrap refused: personal event data exists';
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM public.events WHERE source_system IS NOT NULL) THEN
    RAISE EXCEPTION 'Bootstrap refused: source identities are already initialized';
  END IF;
  -- Existing RPC validates the complete baseline and applies all changes atomically.
  RETURN public.apply_wieik_import(p_expected, p_changes);
END;
$$;
REVOKE ALL ON FUNCTION public.bootstrap_wieik_import(jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_wieik_import(jsonb,jsonb) TO service_role;
COMMENT ON FUNCTION public.bootstrap_wieik_import(jsonb,jsonb) IS
  'One-time import before personal event features. Checks empty references inside the transaction. Not an AI tool.';
COMMIT;
