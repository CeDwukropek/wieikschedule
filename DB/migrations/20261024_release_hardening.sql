-- STAGING FIRST. Requires 20261023_plan_versions_and_hygiene.sql. Aligns the Supabase project with the
-- staging contract before release: private rows block source deletions, browser roles can only read
-- the public plan, and Supabase-only helpers are not callable over the API. No rows are changed.
BEGIN;

-- 1. The importer never deletes source rows; a manual DELETE must not silently drop private rows.
ALTER TABLE public.user_added_events DROP CONSTRAINT user_added_events_event_id_fkey,
  ADD CONSTRAINT user_added_events_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE RESTRICT;
ALTER TABLE public.user_event_tags DROP CONSTRAINT user_event_tags_event_id_fkey,
  ADD CONSTRAINT user_event_tags_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS user_added_events_event_idx ON public.user_added_events (event_id);
CREATE INDEX IF NOT EXISTS user_event_tags_tag_idx ON public.user_event_tags (tag_id);

-- 2. user_added_events_active_key (one active addition per user and class) replaces the per-plan index.
DROP INDEX IF EXISTS public.uniq_user_added_event_active;

-- 3. Supabase grants everything to anon/authenticated by default and relies on RLS alone. The browser
-- reads only the public plan; private tables are reached through the API's service role.
REVOKE ALL ON public.events, public.faculties, public.timetable_versions, public.users,
  public.user_added_events, public.user_event_tags, public.tag_definitions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.events, public.faculties, public.timetable_versions TO anon, authenticated;
-- service_role bypasses RLS, so this policy only cost a per-row auth.role() call on every read.
DROP POLICY IF EXISTS "Service role write" ON public.events;

-- 4. Helpers that exist only in the Supabase project.
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
  IF to_regprocedure('public.validate_user_event_tag_ownership()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.validate_user_event_tag_ownership() FROM PUBLIC, anon, authenticated;
    ALTER FUNCTION public.validate_user_event_tag_ownership() SET search_path = public, pg_catalog;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
