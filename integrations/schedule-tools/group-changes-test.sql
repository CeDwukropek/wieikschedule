\set ON_ERROR_STOP on
-- A starosta's change of a class for the whole group (20261031): roles, revisions, all or nothing, history, grants.
BEGIN;
DO $$
DECLARE head uuid; lk1 uuid; student uuid; e1 uuid; e2 uuid; lecture uuid; off uuid; result jsonb; rev integer;
BEGIN
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-group-head') RETURNING id INTO head;
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-group-lk1') RETURNING id INTO lk1;
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-group-student') RETURNING id INTO student;
 INSERT INTO public.plan_roles(user_id,role,faculty) VALUES(head,'starosta','TESTG');
 INSERT INTO public.plan_roles(user_id,role,faculty,"group") VALUES(lk1,'group_starosta','TESTG','Lk1');
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,"group",status,source_system,source_key)
   VALUES('TESTG','2026-11-02','09:00',90,'Synthetic lab','Lk1','aktywne','wieik','["stac","g1","2026-11-02","Lk1"]') RETURNING id INTO e1;
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,"group",status,source_system,source_key)
   VALUES('TESTG','2026-11-09','09:00',90,'Synthetic lab','Lk1','aktywne','wieik','["stac","g1","2026-11-09","Lk1"]') RETURNING id INTO e2;
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,"group",status,source_system,source_key)
   VALUES('TESTG','2026-11-03','11:00',135,'Synthetic lecture','W','aktywne','wieik','["stac","g2","2026-11-03","W"]') RETURNING id INTO lecture;
 INSERT INTO public.events(faculty,date,start_time,duration_min,subject,"group",status,source_system,source_key)
   VALUES('TESTG','2026-11-16','09:00',90,'Synthetic lab','Lk1','nieaktywne','wieik','["stac","g1","2026-11-16","Lk1"]') RETURNING id INTO off;

 -- The group's starosta moves both labs of the series a day later, in one call.
 result:=public.apply_group_schedule_changes(lk1,jsonb_build_array(
   jsonb_build_object('event_id',e1,'operation','upsert','action','modify','patch',jsonb_build_object('date','2026-11-03','room','B2'),'revision',null),
   jsonb_build_object('event_id',e2,'operation','upsert','action','modify','patch',jsonb_build_object('date','2026-11-10'),'revision',null)));
 IF jsonb_array_length(result)<>2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(result) r WHERE r.value->'previous'<>'null'::jsonb
    OR r.value->'current'->>'revision'<>'1' OR r.value->'current' ? 'author_id') THEN RAISE EXCEPTION 'Group change result: %', result; END IF;
 IF (SELECT faculty||'/'||"group" FROM public.group_schedule_overrides WHERE event_id=e1)<>'TESTG/Lk1' THEN
   RAISE EXCEPTION 'Plan and group not taken from the class'; END IF;

 -- The group's starosta may not change a lecture of all groups, nor may a student anything; the plan's starosta may.
 BEGIN
   PERFORM public.apply_group_schedule_changes(lk1,jsonb_build_array(jsonb_build_object('event_id',lecture,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',null)));
   RAISE EXCEPTION 'Group starosta changed a lecture';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
   PERFORM public.apply_group_schedule_changes(student,jsonb_build_array(jsonb_build_object('event_id',e1,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',1)));
   RAISE EXCEPTION 'Student changed a class for the group';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 PERFORM public.apply_group_schedule_changes(head,jsonb_build_array(jsonb_build_object('event_id',lecture,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',null)));

 -- A change made on an older version is refused (another starosta changed it meanwhile).
 BEGIN
   PERFORM public.apply_group_schedule_changes(head,jsonb_build_array(jsonb_build_object('event_id',e1,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',null)));
   RAISE EXCEPTION 'Stale revision accepted';
 EXCEPTION WHEN SQLSTATE 'PT409' THEN NULL; END;
 result:=public.apply_group_schedule_changes(head,jsonb_build_array(jsonb_build_object('event_id',e1,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',1)));
 IF result->0->'previous'->>'action'<>'modify' OR result->0->'current'->>'revision'<>'2' THEN RAISE EXCEPTION 'Update result: %', result; END IF;

 -- One invalid class (inactive) or an invalid patch keeps the whole batch out.
 BEGIN
   PERFORM public.apply_group_schedule_changes(head,jsonb_build_array(
     jsonb_build_object('event_id',e2,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',1),
     jsonb_build_object('event_id',off,'operation','upsert','action','cancel','patch','{}'::jsonb,'revision',null)));
   RAISE EXCEPTION 'Batch with an inactive class accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
   PERFORM public.apply_group_schedule_changes(head,jsonb_build_array(
     jsonb_build_object('event_id',e2,'operation','upsert','action','modify','patch',jsonb_build_object('start_time','21:30:00'),'revision',1)));
   RAISE EXCEPTION 'Class past 22:00 accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 IF (SELECT action FROM public.group_schedule_overrides WHERE event_id=e2)<>'modify' THEN RAISE EXCEPTION 'Partial batch applied'; END IF;

 -- Undo: back to the university plan; the history keeps every step, without authors in the change itself.
 SELECT revision INTO rev FROM public.group_schedule_overrides WHERE event_id=e2;
 PERFORM public.apply_group_schedule_changes(lk1,jsonb_build_array(jsonb_build_object('event_id',e2,'operation','delete','revision',rev)));
 IF EXISTS(SELECT FROM public.group_schedule_overrides WHERE event_id=e2) THEN RAISE EXCEPTION 'Undo failed'; END IF;
 IF (SELECT count(*) FROM public.group_schedule_override_history WHERE event_id IN (e1,e2,lecture))<>5 THEN RAISE EXCEPTION 'History incomplete'; END IF;
 BEGIN
   PERFORM public.apply_group_schedule_changes(head,jsonb_build_array(jsonb_build_object('event_id',e2,'operation','delete','revision',null)));
   RAISE EXCEPTION 'Deleting a missing change accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;

 -- Duplicates, empty and too long batches; no access for the browser roles.
 BEGIN
   PERFORM public.apply_group_schedule_changes(head,jsonb_build_array(
     jsonb_build_object('event_id',e2,'operation','upsert','action','cancel'),jsonb_build_object('event_id',e2,'operation','upsert','action','cancel')));
   RAISE EXCEPTION 'Duplicate event accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.apply_group_schedule_changes(head,'[]'); RAISE EXCEPTION 'Empty batch accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.apply_group_schedule_changes(head,(SELECT jsonb_agg(jsonb_build_object('event_id',gen_random_uuid())) FROM generate_series(1,41)));
   RAISE EXCEPTION 'Batch of 41 accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 IF has_function_privilege('anon','public.apply_group_schedule_changes(uuid,jsonb)','EXECUTE')
    OR has_function_privilege('authenticated','public.apply_group_schedule_changes(uuid,jsonb)','EXECUTE')
    OR has_table_privilege('anon','public.group_schedule_overrides','SELECT')
    OR has_table_privilege('authenticated','public.group_schedule_overrides','INSERT') THEN
   RAISE EXCEPTION 'Group change grants leaked'; END IF;
 RAISE NOTICE 'Group class changes: roles, revisions, all-or-nothing, undo, history and grants passed';
END $$;
ROLLBACK;
