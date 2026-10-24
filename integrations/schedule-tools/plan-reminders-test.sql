\set ON_ERROR_STOP on
-- Reminder settings (20261030): one row per person, an object of limited size, backend-only.
BEGIN;
DO $$
DECLARE a uuid;
BEGIN
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-reminders') RETURNING id INTO a;
 INSERT INTO public.plan_item_preferences(user_id,reminders) VALUES(a,'{"kolokwium":[{"days_before":1,"at":"18:00"}]}');
 BEGIN
   INSERT INTO public.plan_item_preferences(user_id,reminders) VALUES(a,'{}');
   RAISE EXCEPTION 'Second row for one person accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
   UPDATE public.plan_item_preferences SET reminders='[]' WHERE user_id=a;
   RAISE EXCEPTION 'Non-object settings accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
   UPDATE public.plan_item_preferences SET reminders=jsonb_build_object('x',repeat('y',5000)) WHERE user_id=a;
   RAISE EXCEPTION 'Oversized settings accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 DELETE FROM public.users WHERE id=a;
 IF EXISTS(SELECT FROM public.plan_item_preferences WHERE user_id=a) THEN RAISE EXCEPTION 'Settings outlived the account'; END IF;
 IF has_table_privilege('anon','public.plan_item_preferences','SELECT') OR has_table_privilege('authenticated','public.plan_item_preferences','INSERT')
   THEN RAISE EXCEPTION 'Reminder settings grants leaked'; END IF;
 RAISE NOTICE 'Reminder settings: one row, object only, size limit, cascade and grants passed';
END $$;
ROLLBACK;
