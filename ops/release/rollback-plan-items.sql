-- Removes everything 20261025_plan_items_and_roles.sql added. Refuses while any entry or role exists,
-- so it can only undo the migration itself, never user data. Usage: psql -f rollback-plan-items.sql
\set ON_ERROR_STOP on
BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.plan_items) OR EXISTS (SELECT 1 FROM public.plan_roles WHERE role <> 'admin') THEN
    RAISE EXCEPTION 'Rollback refused: plan entries or roles exist';
  END IF;
END $$;
DROP TRIGGER events_review_plan_items ON public.events;
DROP TRIGGER carry_over_starosta ON public.timetable_versions;
DROP FUNCTION public.plan_item_writable(uuid,public.plan_items);
DROP TABLE public.plan_item_state, public.plan_item_history, public.plan_items, public.plan_role_invites, public.plan_roles;
DROP FUNCTION public.plan_can_write(uuid,text,text), public.plan_role_can_grant(uuid,text,text),
  public.plan_item_anchor(public.events), public.guard_plan_item(), public.record_plan_item_history(),
  public.events_review_plan_items(), public.save_plan_items(uuid,jsonb), public.remove_plan_items(uuid,jsonb,boolean),
  public.set_plan_item_state(uuid,uuid,jsonb), public.create_plan_role_invite(uuid,text,text,text,text),
  public.redeem_plan_role_invite(uuid,text), public.revoke_plan_role(uuid,uuid), public.carry_over_starosta(),
  public.purge_plan_ephemera();
DELETE FROM public.tag_definitions WHERE scope = 'system' AND key IN ('egzamin','poprawa','projekt','inne');
NOTIFY pgrst, 'reload schema';
COMMIT;
