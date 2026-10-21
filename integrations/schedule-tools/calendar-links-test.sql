\set ON_ERROR_STOP on
-- Requires DB/migrations/20261021_calendar_links.sql and 20261022_calendar_writes.sql. Everything is rolled back.
BEGIN;
DO $$
DECLARE a uuid; b uuid; link jsonb; used jsonb; i integer;
  code_a text := repeat('a',64); token_a text := repeat('1',64);
BEGIN
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-calendar-a') RETURNING id INTO a;
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-calendar-b') RETURNING id INTO b;
 PERFORM public.create_calendar_link_code(a,code_a,'Odysseus','EiAs3','set-1');
 link:=public.pair_calendar_link(code_a,token_a);
 IF link->>'faculty'<>'EiAs3' OR link->>'group_set_id'<>'set-1' THEN RAISE EXCEPTION 'Pair result wrong'; END IF;
 BEGIN
   PERFORM public.pair_calendar_link(code_a,repeat('2',64));
   RAISE EXCEPTION 'Code reused';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 used:=public.use_calendar_link(token_a);
 IF (used->>'user_id')::uuid<>a OR used->>'firebase_uid'<>'synthetic-calendar-a' THEN RAISE EXCEPTION 'Wrong owner'; END IF;
 -- Unused for 180 days: expired. Used yesterday: still valid and extended.
 UPDATE public.calendar_links SET last_used_at=now()-interval '181 days' WHERE token_hash=token_a;
 BEGIN
   PERFORM public.use_calendar_link(token_a);
   RAISE EXCEPTION 'Expired link accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 UPDATE public.calendar_links SET last_used_at=now()-interval '179 days' WHERE token_hash=token_a;
 PERFORM public.use_calendar_link(token_a);
 IF (SELECT last_used_at FROM public.calendar_links WHERE token_hash=token_a)<now()-interval '1 minute' THEN
   RAISE EXCEPTION 'Use did not extend link'; END IF;
 UPDATE public.calendar_links SET revoked_at=now() WHERE token_hash=token_a;
 BEGIN
   PERFORM public.use_calendar_link(token_a);
   RAISE EXCEPTION 'Revoked link accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 PERFORM public.create_calendar_link_code(b,repeat('b',64),'Odysseus','EiAs3','set-1');
 UPDATE public.calendar_link_codes SET expires_at=now()-interval '1 second' WHERE code_hash=repeat('b',64);
 BEGIN
   PERFORM public.pair_calendar_link(repeat('b',64),repeat('3',64));
   RAISE EXCEPTION 'Expired code accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 FOR i IN 1..5 LOOP
   PERFORM public.create_calendar_link_code(b,lpad(i::text,64,'c'),'Odysseus','EiAs3','set-1');
 END LOOP;
 BEGIN
   PERFORM public.create_calendar_link_code(b,repeat('d',64),'Odysseus','EiAs3','set-1');
   RAISE EXCEPTION 'Code limit not enforced';
 EXCEPTION WHEN program_limit_exceeded THEN NULL; END;
 BEGIN
   INSERT INTO public.calendar_links(user_id,token_hash,label,faculty,group_set_id) VALUES(a,'plain-token','x','EiAs3','set-1');
   RAISE EXCEPTION 'Plain token stored';
 EXCEPTION WHEN check_violation THEN NULL; END;
 IF has_table_privilege('anon','public.calendar_links','SELECT') OR
    has_table_privilege('authenticated','public.calendar_link_codes','SELECT') OR
    has_function_privilege('anon','public.use_calendar_link(text)','EXECUTE') OR
    has_function_privilege('authenticated','public.pair_calendar_link(text,text)','EXECUTE') OR
    has_function_privilege('authenticated','public.create_calendar_link_code(uuid,text,text,text,text)','EXECUTE') THEN
   RAISE EXCEPTION 'Calendar link grants leaked'; END IF;
 RAISE NOTICE 'Calendar links: pairing, one-time codes, 180-day expiry, revocation, limits, hashes and grants passed';
END $$;
DO $$
DECLARE u uuid; ev uuid; p jsonb; r jsonb;
BEGIN
 INSERT INTO public.users(firebase_uid) VALUES('synthetic-calendar-writes') RETURNING id INTO u;
 SELECT id INTO ev FROM public.events WHERE source_system IS NOT NULL AND status='aktywne' AND extract(isodow FROM date)<=5 ORDER BY id LIMIT 1;
 p:=public.propose_schedule_change(u,ev,'upsert','modify','{"start_time":"12:00:00"}',null,'odysseus-calendar','cal:link:req-1');
 r:=public.confirm_schedule_change(u,(p->>'id')::uuid,'odysseus-calendar','cal:link:req-1');
 IF r->'override'->'patch'<>'{"start_time":"12:00:00"}' THEN RAISE EXCEPTION 'Calendar provider failed'; END IF;
 BEGIN
   PERFORM public.propose_schedule_change(u,ev,'upsert','cancel','{}',null,'unknown','x');
   RAISE EXCEPTION 'Unknown provider accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 RAISE NOTICE 'Calendar writes: odysseus-calendar provider propose/confirm and constraint passed';
END $$;
ROLLBACK;
