\set ON_ERROR_STOP on
-- Private changes of several occurrences (20261029): all or nothing, the same checks as one change, undo data.
BEGIN;
DO $$
DECLARE a uuid; b uuid; e1 uuid; e2 uuid; e3 uuid; result jsonb; again jsonb;
BEGIN
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-batch-a') RETURNING id INTO a;
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-batch-b') RETURNING id INTO b;
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,status,source_system,source_key)
   VALUES('TEST','2026-11-02','09:00',90,'Synthetic series','aktywne','wieik','["stac","s1","2026-11-02","L1"]') RETURNING id INTO e1;
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,status,source_system,source_key)
   VALUES('TEST','2026-11-09','09:00',90,'Synthetic series','aktywne','wieik','["stac","s1","2026-11-09","L1"]') RETURNING id INTO e2;
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,status,source_system,source_key)
   VALUES('TEST','2026-11-16','09:00',90,'Synthetic series','nieaktywne','wieik','["stac","s1","2026-11-16","L1"]') RETURNING id INTO e3;

 -- A whole series moved a day later, in one call; each occurrence remembers it had no change before.
 result:=public.apply_schedule_changes(a,jsonb_build_array(
   jsonb_build_object('event_id',e1,'operation','upsert','action','modify','patch',jsonb_build_object('date','2026-11-03')),
   jsonb_build_object('event_id',e2,'operation','upsert','action','modify','patch',jsonb_build_object('date','2026-11-10'))),'manual:batch1');
 IF jsonb_array_length(result)<>2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(result) r WHERE r.value->'expected_override'<>'null'::jsonb)
   THEN RAISE EXCEPTION 'Batch result: %', result; END IF;
 IF (SELECT count(*) FROM public.schedule_overrides WHERE user_id=a AND action='modify')<>2 THEN RAISE EXCEPTION 'Batch not applied'; END IF;
 IF (SELECT count(*) FROM public.schedule_change_proposals WHERE user_id=a AND session_id LIKE 'manual:batch1:%' AND consumed_at IS NOT NULL)<>2
   THEN RAISE EXCEPTION 'Batch previews not kept for replay'; END IF;

 -- One invalid occurrence (an inactive class) keeps the whole batch out.
 BEGIN
   PERFORM public.apply_schedule_changes(a,jsonb_build_array(
     jsonb_build_object('event_id',e1,'operation','upsert','action','cancel','patch','{}'::jsonb),
     jsonb_build_object('event_id',e3,'operation','upsert','action','cancel','patch','{}'::jsonb)),'manual:batch2');
   RAISE EXCEPTION 'Batch with an inactive class accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 IF (SELECT action FROM public.schedule_overrides WHERE user_id=a AND event_id=e1)<>'modify' THEN RAISE EXCEPTION 'Partial batch applied'; END IF;

 -- Undo restores what each occurrence had before (here: nothing), as one batch again.
 again:=public.apply_schedule_changes(a,jsonb_build_array(
   jsonb_build_object('event_id',e1,'operation','delete'),jsonb_build_object('event_id',e2,'operation','delete')),'manual:batch3');
 IF EXISTS(SELECT FROM public.schedule_overrides WHERE user_id=a) THEN RAISE EXCEPTION 'Batch undo failed'; END IF;
 IF (SELECT count(*) FROM jsonb_array_elements(again) r WHERE r.value->'expected_override'->>'action'='modify')<>2
   THEN RAISE EXCEPTION 'Undo lost the earlier state'; END IF;

 -- Duplicates, empty, too long and foreign users' rows are refused.
 BEGIN
   PERFORM public.apply_schedule_changes(a,jsonb_build_array(
     jsonb_build_object('event_id',e1,'operation','upsert','action','cancel'),jsonb_build_object('event_id',e1,'operation','upsert','action','cancel')),'manual:dup');
   RAISE EXCEPTION 'Duplicate event accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.apply_schedule_changes(a,'[]','manual:empty'); RAISE EXCEPTION 'Empty batch accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.apply_schedule_changes(a,(SELECT jsonb_agg(jsonb_build_object('event_id',gen_random_uuid())) FROM generate_series(1,41)),'manual:long');
   RAISE EXCEPTION 'Batch of 41 accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 IF EXISTS(SELECT FROM public.schedule_overrides WHERE user_id=b) THEN RAISE EXCEPTION 'Other user changed'; END IF;
 IF has_function_privilege('anon','public.apply_schedule_changes(uuid,jsonb,text)','EXECUTE')
    OR has_function_privilege('authenticated','public.apply_schedule_changes(uuid,jsonb,text)','EXECUTE') THEN
   RAISE EXCEPTION 'Batch function grants leaked'; END IF;
 RAISE NOTICE 'Private change batches: series, all-or-nothing, undo, limits and grants passed';
END $$;
ROLLBACK;
