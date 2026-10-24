-- STAGING FIRST. Requires 20261025_plan_items_and_roles.sql. Reminders of kolokwia, deadlines and other entries:
-- one row per person with their own settings by kind; without a row the app's defaults apply. The calendar feed
-- (Odysseus) and the ICS export turn them into reminder times. Written only by the backend, like the other
-- private tables.
BEGIN;
CREATE TABLE public.plan_item_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  reminders jsonb NOT NULL CHECK (jsonb_typeof(reminders) = 'object' AND pg_column_size(reminders) <= 4096),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_item_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.plan_item_preferences FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_item_preferences TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
