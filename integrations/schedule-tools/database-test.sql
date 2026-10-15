\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE a uuid; b uuid; ev uuid; preview jsonb; applied jsonb; retry jsonb; before_source jsonb; count_before integer;
BEGIN
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-override-a') RETURNING id INTO a;
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-override-b') RETURNING id INTO b;
 SELECT id,to_jsonb(e) INTO ev,before_source FROM public.events e
   WHERE source_system IS NOT NULL AND status='aktywne' ORDER BY id LIMIT 1;
 IF ev IS NULL THEN RAISE EXCEPTION 'Need seeded source events'; END IF;
 SELECT count(*) INTO count_before FROM public.schedule_overrides;
 preview:=public.propose_schedule_change(a,ev,'upsert','modify','{"room":null}',null,'manual','test');
 IF (SELECT count(*) FROM public.schedule_overrides)<>count_before THEN RAISE EXCEPTION 'Preview mutated plan'; END IF;
 BEGIN
   PERFORM public.confirm_schedule_change(b,(preview->>'id')::uuid,'manual','test');
   RAISE EXCEPTION 'Cross-owner confirmation accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 BEGIN
   PERFORM public.confirm_schedule_change(a,(preview->>'id')::uuid,'n8n','test');
   RAISE EXCEPTION 'Wrong provider accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 applied:=public.confirm_schedule_change(a,(preview->>'id')::uuid,'manual','test');
 retry:=public.confirm_schedule_change(a,(preview->>'id')::uuid,'manual','test');
 IF applied<>retry OR applied->'override'->'patch' <> '{"room":null}' THEN RAISE EXCEPTION 'Null/retry failed'; END IF;
 IF (SELECT to_jsonb(e) FROM public.events e WHERE id=ev)<>before_source THEN RAISE EXCEPTION 'Source mutated'; END IF;
 IF EXISTS(SELECT FROM public.schedule_overrides WHERE user_id=b) THEN RAISE EXCEPTION 'Owner B modified'; END IF;
 preview:=public.propose_schedule_change(a,ev,'upsert','cancel','{}',null,'n8n','test');
 UPDATE public.schedule_overrides SET reason='concurrent change' WHERE user_id=a AND event_id=ev;
 BEGIN
   PERFORM public.confirm_schedule_change(a,(preview->>'id')::uuid,'n8n','test');
   RAISE EXCEPTION 'Stale override accepted';
 EXCEPTION WHEN serialization_failure THEN NULL; END;
 preview:=public.propose_schedule_change(a,ev,'upsert','cancel','{}',null,'manual','test');
 UPDATE public.events SET room=coalesce(room,'')||' test' WHERE id=ev;
 BEGIN
   PERFORM public.confirm_schedule_change(a,(preview->>'id')::uuid,'manual','test');
   RAISE EXCEPTION 'Stale source accepted';
 EXCEPTION WHEN serialization_failure THEN NULL; END;
 preview:=public.propose_schedule_change(a,ev,'upsert','cancel','{}',null,'manual','test');
 PERFORM public.confirm_schedule_change(a,(preview->>'id')::uuid,'manual','test');
 IF (SELECT action FROM public.schedule_overrides WHERE user_id=a AND event_id=ev)<>'cancel' THEN RAISE EXCEPTION 'Cancel failed'; END IF;
 preview:=public.propose_schedule_change(a,ev,'delete',null,'{}',null,'manual','test');
 PERFORM public.confirm_schedule_change(a,(preview->>'id')::uuid,'manual','test');
 IF EXISTS(SELECT FROM public.schedule_overrides WHERE user_id=a) THEN RAISE EXCEPTION 'Restore failed'; END IF;
 preview:=public.propose_schedule_change(a,ev,'upsert','cancel','{}',null,'manual','test');
 UPDATE public.schedule_change_proposals SET expires_at=now()-interval '1 second' WHERE id=(preview->>'id')::uuid;
 BEGIN
   PERFORM public.confirm_schedule_change(a,(preview->>'id')::uuid,'manual','test');
   RAISE EXCEPTION 'Expired preview accepted';
 EXCEPTION WHEN serialization_failure THEN NULL; END;
 BEGIN
   PERFORM public.validate_schedule_patch(before_source,'modify','{"user_id":"x"}',null);
   RAISE EXCEPTION 'Owner injection accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
   PERFORM public.validate_schedule_patch(before_source,'modify','{"start_time":"21:30:00","duration_min":90}',null);
   RAISE EXCEPTION 'Overnight accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
   PERFORM public.validate_schedule_patch(before_source,'modify','{"date":"2026-10-17"}',null);
   RAISE EXCEPTION 'Unsupported weekend accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 IF has_table_privilege('anon','public.schedule_overrides','SELECT') OR
    has_table_privilege('authenticated','public.schedule_overrides','UPDATE') OR
    has_function_privilege('anon','public.confirm_schedule_change(uuid,uuid,text,text)','EXECUTE') OR
    has_function_privilege('authenticated','public.propose_schedule_change(uuid,uuid,text,text,jsonb,text,text,text)','EXECUTE') THEN
   RAISE EXCEPTION 'Private object grants leaked'; END IF;
 RAISE NOTICE 'Private changes: preview, ownership, null, CAS, replay, expiry, restore and grants passed';
END $$;
ROLLBACK;
