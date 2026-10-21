-- STAGING FIRST. Requires 20261015_personal_overrides.sql and 20261021_calendar_links.sql.
-- Changes made in a linked external calendar are audited as their own provider.
BEGIN;
ALTER TABLE public.schedule_change_proposals DROP CONSTRAINT schedule_change_proposals_provider_check;
ALTER TABLE public.schedule_change_proposals ADD CONSTRAINT schedule_change_proposals_provider_check
  CHECK (provider IN ('manual','n8n','odysseus','odysseus-calendar'));
-- Retries of the same calendar request find the consumed proposal instead of applying twice.
CREATE INDEX schedule_proposals_session_idx ON public.schedule_change_proposals(user_id,provider,session_id);
COMMIT;
