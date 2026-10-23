\set ON_ERROR_STOP on
-- Requires DB/migrations/20261025_plan_items_and_roles.sql. Everything is rolled back.
BEGIN;
DO $$
DECLARE
  admin uuid; starosta uuid; leader uuid; student uuid; other uuid;
  lab uuid := gen_random_uuid(); other_lab uuid := gen_random_uuid(); lecture uuid := gen_random_uuid();
  holiday uuid := gen_random_uuid(); gone uuid := gen_random_uuid();
  base date := date_trunc('week', current_date + 14)::date;
  saved jsonb; quiz jsonb; mine jsonb; reports jsonb; removed jsonb; invite_role jsonb; expected jsonb; moved jsonb;
  leader_role uuid;
BEGIN
  INSERT INTO public.users (firebase_uid) VALUES ('synthetic-items-admin') RETURNING id INTO admin;
  INSERT INTO public.users (firebase_uid) VALUES ('synthetic-items-starosta') RETURNING id INTO starosta;
  INSERT INTO public.users (firebase_uid) VALUES ('synthetic-items-leader') RETURNING id INTO leader;
  INSERT INTO public.users (firebase_uid) VALUES ('synthetic-items-student') RETURNING id INTO student;
  INSERT INTO public.users (firebase_uid) VALUES ('synthetic-items-other') RETURNING id INTO other;
  INSERT INTO public.events (id, faculty, date, start_time, duration_min, subject, "group", type, status, source_system, source_key) VALUES
    (lab, 'TestPs3', base, '10:15', 90, 'Modelowanie', 'Lk4', 'Labolatorium Komputerowe', 'aktywne', 'wieik-v1', 'test-items-lab'),
    (other_lab, 'TestPs3', base + 2, '12:00', 90, 'Modelowanie', 'Lk2', 'Labolatorium Komputerowe', 'aktywne', 'wieik-v1', 'test-items-other'),
    (lecture, 'TestPs3', base + 1, '08:00', 90, 'Modelowanie', 'W', 'Wykład', 'aktywne', 'wieik-v1', 'test-items-lecture'),
    (holiday, 'TestPs3', base + 3, '07:00', 900, 'Święto', NULL, NULL, 'wolne', 'wieik-v1', 'test-items-holiday'),
    (gone, 'TestPs3', base + 4, '10:15', 90, 'Modelowanie', 'Lk4', 'Labolatorium Komputerowe', 'nieaktywne', 'wieik-v1', 'test-items-gone');

  -- Roles: the admin comes from ops; everything else is granted by one-time codes.
  INSERT INTO public.plan_roles (user_id, role) VALUES (admin, 'admin');
  BEGIN
    PERFORM public.create_plan_role_invite(student, repeat('a', 64), 'starosta', 'TestPs3', NULL);
    RAISE EXCEPTION 'Student created a starosta invite';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  PERFORM public.create_plan_role_invite(admin, repeat('a', 64), 'starosta', 'TestPs3', NULL);
  invite_role := public.redeem_plan_role_invite(starosta, repeat('a', 64));
  IF invite_role->>'role' <> 'starosta' OR (invite_role->>'replaced')::boolean THEN RAISE EXCEPTION 'Starosta not granted'; END IF;
  BEGIN
    PERFORM public.redeem_plan_role_invite(leader, repeat('a', 64));
    RAISE EXCEPTION 'Used invite accepted';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  BEGIN
    PERFORM public.create_plan_role_invite(starosta, repeat('b', 64), 'starosta', 'TestPs3', NULL);
    RAISE EXCEPTION 'Starosta created a starosta invite';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.create_plan_role_invite(starosta, repeat('b', 64), 'group_starosta', 'TestPs3', 'Lk99');
    RAISE EXCEPTION 'Unknown group accepted';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  PERFORM public.create_plan_role_invite(starosta, repeat('b', 64), 'group_starosta', 'TestPs3', 'Lk4');
  leader_role := (public.redeem_plan_role_invite(leader, repeat('b', 64))->>'id')::uuid;
  PERFORM public.create_plan_role_invite(starosta, repeat('c', 64), 'group_starosta', 'TestPs3', 'Lk2');
  UPDATE public.plan_role_invites SET expires_at = now() - interval '1 second' WHERE code_hash = repeat('c', 64);
  BEGIN
    PERFORM public.redeem_plan_role_invite(other, repeat('c', 64));
    RAISE EXCEPTION 'Expired invite accepted';
  EXCEPTION WHEN no_data_found THEN NULL; END;

  -- Who may write what.
  mine := public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
    'kind', 'kolokwium', 'timing', 'class', 'event_id', lab, 'title', 'Kolokwium 1')))->0;
  IF (mine->>'date')::date <> base OR mine->'anchor'->>'start_time' <> '10:15:00' OR mine->>'group' <> 'Lk4' THEN
    RAISE EXCEPTION 'Class entry did not copy its class: %', mine; END IF;
  BEGIN
    PERFORM public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
      'kind', 'kolokwium', 'timing', 'class', 'event_id', lab, 'title', 'Kolokwium 1')));
    RAISE EXCEPTION 'Student wrote a group entry';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  quiz := public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'other',
    'kind', 'kolokwium', 'timing', 'class', 'event_id', lab, 'title', ' Kolokwium 1 ', 'details', 'Rozdziały 1–3')))->0;
  IF quiz->>'faculty' <> 'TestPs3' OR quiz->>'title' <> 'Kolokwium 1' OR quiz ? 'author_id' THEN
    RAISE EXCEPTION 'Group entry not normalised: %', quiz; END IF;
  BEGIN
    PERFORM public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
      'kind', 'kolokwium', 'timing', 'class', 'event_id', other_lab, 'title', 'Kolokwium 1')));
    RAISE EXCEPTION 'Group starosta wrote for another group';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
      'subject', 'Modelowanie', 'kind', 'egzamin', 'timing', 'slot', 'date', base + 5, 'start_time', '09:00',
      'duration_min', 120, 'title', 'Egzamin')));
    RAISE EXCEPTION 'Group starosta wrote for every group';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  -- The plan's starosta may write for every group, also on a Saturday.
  saved := public.save_plan_items(starosta, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
    'subject', 'Modelowanie', 'kind', 'egzamin', 'timing', 'slot', 'date', base + 5, 'start_time', '09:00',
    'duration_min', 120, 'title', 'Egzamin')))->0;
  IF saved->>'group' IS NOT NULL OR saved->>'series_id' IS NOT NULL THEN RAISE EXCEPTION 'All-groups slot wrong: %', saved; END IF;
  PERFORM public.save_plan_items(admin, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
    'kind', 'wejsciowka', 'timing', 'class', 'event_id', other_lab, 'title', 'Wejściówka')));

  -- Rules.
  BEGIN
    PERFORM public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
      'kind', 'inne', 'timing', 'slot', 'date', base, 'start_time', '21:30', 'duration_min', 60, 'title', 'Za późno')));
    RAISE EXCEPTION 'Slot past 22:00 accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
      'kind', 'kolokwium', 'timing', 'class', 'event_id', holiday, 'title', 'Święto')));
    RAISE EXCEPTION 'Entry on a day off accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
      'kind', 'kolokwium', 'timing', 'class', 'event_id', gone, 'title', 'Odwołane')));
    RAISE EXCEPTION 'Entry on a cancelled class accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
      'owner_id', other, 'kind', 'inne', 'timing', 'due', 'date', base, 'title', 'Cudze')));
    RAISE EXCEPTION 'Owner injection accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(student, (SELECT jsonb_agg(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
      'kind', 'inne', 'timing', 'due', 'date', base + n, 'title', 'Termin')) FROM generate_series(1, 21) AS n));
    RAISE EXCEPTION 'More than 20 entries accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(starosta, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
      'subject', 'Nieistniejący', 'kind', 'inne', 'timing', 'due', 'date', base, 'title', 'Termin')));
    RAISE EXCEPTION 'Unknown subject accepted';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  BEGIN
    PERFORM public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
      'kind', 'kolokwium', 'timing', 'class', 'event_id', lab, 'title', 'Kolokwium 1 (drugi raz)')));
    RAISE EXCEPTION 'Duplicate group entry accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- Several new entries form one series; a later entry can extend it.
  reports := public.save_plan_items(leader, (SELECT jsonb_agg(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
    'subject', 'Modelowanie', 'group', 'Lk4', 'kind', 'sprawozdanie', 'timing', 'due', 'date', base + 7 * n,
    'due_time', '23:59', 'title', 'Sprawozdanie ' || n)) FROM generate_series(1, 3) AS n));
  IF (SELECT count(DISTINCT value->>'series_id') FROM jsonb_array_elements(reports)) <> 1 OR reports->0->>'series_id' IS NULL THEN
    RAISE EXCEPTION 'Entries saved together are not one series'; END IF;
  PERFORM public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('scope', 'group', 'faculty', 'TestPs3',
    'subject', 'Modelowanie', 'group', 'Lk4', 'kind', 'sprawozdanie', 'timing', 'due', 'date', base + 28,
    'title', 'Sprawozdanie 4', 'series_id', reports->0->>'series_id')));
  IF (SELECT count(*) FROM public.plan_items WHERE series_id = (reports->0->>'series_id')::uuid) <> 4 THEN
    RAISE EXCEPTION 'Series was not extended'; END IF;
  BEGIN
    PERFORM public.save_plan_items(student, jsonb_build_array(jsonb_build_object('scope', 'personal', 'faculty', 'TestPs3',
      'kind', 'inne', 'timing', 'due', 'date', base, 'title', 'Do cudzej serii', 'series_id', reports->0->>'series_id')));
    RAISE EXCEPTION 'Student extended a group series';
  EXCEPTION WHEN no_data_found THEN NULL; END;

  -- Updates need the revision the caller saw.
  BEGIN
    PERFORM public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('id', quiz->>'id', 'revision', 99, 'title', 'Nowy')));
    RAISE EXCEPTION 'Stale update accepted';
  EXCEPTION WHEN serialization_failure THEN NULL; END;
  quiz := public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('id', quiz->>'id', 'revision', quiz->'revision',
    'details', 'Rozdziały 1–4')))->0;
  IF (quiz->>'revision')::integer <> 2 OR quiz->>'details' <> 'Rozdziały 1–4' THEN RAISE EXCEPTION 'Update failed: %', quiz; END IF;

  -- The import moves the class: the entry follows it and waits for review; moving back clears the review.
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'faculty', e.faculty, 'date', e.date,
    'start_time', e.start_time, 'duration_min', e.duration_min, 'subject', e.subject, 'instructor', e.instructor,
    'room', e.room, 'group', e."group", 'type', e.type, 'status', e.status, 'source_system', e.source_system,
    'source_key', e.source_key) ORDER BY e.id), '[]') INTO expected FROM public.events AS e;
  SELECT jsonb_build_array(value || jsonb_build_object('date', base + 7)) INTO moved
    FROM jsonb_array_elements(expected) WHERE (value->>'id')::uuid = lab;
  PERFORM public.apply_wieik_import(expected, moved);
  SELECT to_jsonb(item) INTO quiz FROM public.plan_items AS item WHERE id = (quiz->>'id')::uuid;
  IF (quiz->>'date')::date <> base + 7 OR quiz->>'state' <> 'review' OR quiz->>'review_reason' <> 'moved'
     OR (quiz->'anchor'->>'date')::date <> base THEN
    RAISE EXCEPTION 'Moved class not reviewed: %', quiz; END IF;
  IF (SELECT state FROM public.plan_items WHERE id = (mine->>'id')::uuid) <> 'review' THEN
    RAISE EXCEPTION 'Personal entry did not follow its class'; END IF;
  UPDATE public.events SET date = base WHERE id = lab;
  IF (SELECT state FROM public.plan_items WHERE id = (quiz->>'id')::uuid) <> 'active' THEN
    RAISE EXCEPTION 'Class back in place still under review'; END IF;
  UPDATE public.events SET status = 'nieaktywne' WHERE id = lab;
  IF (SELECT review_reason FROM public.plan_items WHERE id = (quiz->>'id')::uuid) <> 'cancelled' THEN
    RAISE EXCEPTION 'Cancelled class not reviewed'; END IF;
  UPDATE public.events SET status = 'aktywne', start_time = '12:00' WHERE id = lab;
  SELECT to_jsonb(item) INTO quiz FROM public.plan_items AS item WHERE id = (quiz->>'id')::uuid;
  quiz := public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('id', quiz->>'id', 'revision', quiz->'revision')))->0;
  IF quiz->>'state' <> 'active' OR quiz->'anchor'->>'start_time' <> '12:00:00' THEN
    RAISE EXCEPTION 'Saving did not confirm the review: %', quiz; END IF;
  IF (SELECT array_agg(operation ORDER BY revision) FROM public.plan_item_history WHERE item_id = (quiz->>'id')::uuid)
     <> ARRAY['create','update','review','review','review','review','update'] THEN
    RAISE EXCEPTION 'History incomplete: %', (SELECT array_agg(operation ORDER BY revision) FROM public.plan_item_history
      WHERE item_id = (quiz->>'id')::uuid); END IF;
  IF EXISTS (SELECT 1 FROM public.plan_item_history AS h JOIN public.plan_items AS i ON i.id = h.item_id WHERE i.scope = 'personal') THEN
    RAISE EXCEPTION 'Personal entries have a shared history'; END IF;
  BEGIN
    DELETE FROM public.events WHERE id = lab;
    RAISE EXCEPTION 'Class with entries deleted';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;

  -- Delete and undo.
  BEGIN
    PERFORM public.remove_plan_items(student, jsonb_build_array(jsonb_build_object('id', quiz->>'id', 'revision', quiz->'revision')));
    RAISE EXCEPTION 'Student deleted a group entry';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  removed := public.remove_plan_items(leader, jsonb_build_array(jsonb_build_object('id', quiz->>'id', 'revision', quiz->'revision')));
  IF (SELECT deleted_at FROM public.plan_items WHERE id = (quiz->>'id')::uuid) IS NULL THEN RAISE EXCEPTION 'Delete failed'; END IF;
  PERFORM public.remove_plan_items(leader, removed, true);
  IF (SELECT deleted_at FROM public.plan_items WHERE id = (quiz->>'id')::uuid) IS NOT NULL THEN RAISE EXCEPTION 'Undo failed'; END IF;

  -- Personal progress on any visible entry; never on someone else's private one.
  saved := public.set_plan_item_state(student, (quiz->>'id')::uuid, '{"progress":"ready","note":" Powtórzyć "}');
  IF saved->>'progress' <> 'ready' OR saved->>'note' <> 'Powtórzyć' OR saved ? 'user_id' THEN RAISE EXCEPTION 'State failed: %', saved; END IF;
  saved := public.set_plan_item_state(student, (quiz->>'id')::uuid, '{"hidden":true}');
  IF saved->>'progress' <> 'ready' OR NOT (saved->>'hidden')::boolean THEN RAISE EXCEPTION 'Partial state lost fields'; END IF;
  BEGIN
    PERFORM public.set_plan_item_state(other, (mine->>'id')::uuid, '{"hidden":true}');
    RAISE EXCEPTION 'State on a private entry of another user accepted';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  BEGIN
    PERFORM public.set_plan_item_state(student, (quiz->>'id')::uuid, '{"progress":"submitted"}');
    RAISE EXCEPTION 'Unknown progress accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- A new semester keeps its starosta (also across a split into specialisations), but not group starostas.
  INSERT INTO public.events (faculty, date, start_time, subject, "group", status, source_system, source_key)
    VALUES ('TestPs4', base, '08:00', 'Modelowanie', 'Lk4', 'aktywne', 'wieik-v1', 'test-items-next');
  IF NOT EXISTS (SELECT 1 FROM public.plan_roles WHERE role = 'starosta' AND faculty = 'TestPs4' AND user_id = starosta
                 AND carried_from = 'TestPs3') THEN RAISE EXCEPTION 'Starosta not carried over'; END IF;
  IF EXISTS (SELECT 1 FROM public.plan_roles WHERE role = 'group_starosta' AND faculty = 'TestPs4') THEN
    RAISE EXCEPTION 'Group starosta carried over'; END IF;
  INSERT INTO public.events (faculty, date, start_time, subject, status, source_system, source_key)
    VALUES ('TestQs6', base, '08:00', 'Sieci', 'aktywne', 'wieik-v1', 'test-items-q6');
  INSERT INTO public.plan_roles (user_id, role, faculty) VALUES (other, 'starosta', 'TestQs6');
  INSERT INTO public.events (faculty, date, start_time, subject, status, source_system, source_key)
    VALUES ('TestQs7A', base, '08:00', 'Sieci', 'aktywne', 'wieik-v1', 'test-items-q7a'),
           ('TestQs7I', base, '08:00', 'Sieci', 'aktywne', 'wieik-v1', 'test-items-q7i'),
           ('TestPs1', base, '08:00', 'Wstęp', 'aktywne', 'wieik-v1', 'test-items-p1');
  IF (SELECT count(*) FROM public.plan_roles WHERE role = 'starosta' AND user_id = other AND faculty IN ('TestQs7A','TestQs7I')) <> 2 THEN
    RAISE EXCEPTION 'Starosta not carried into specialisations'; END IF;
  IF EXISTS (SELECT 1 FROM public.plan_roles WHERE faculty = 'TestPs1') THEN RAISE EXCEPTION 'Role carried backwards'; END IF;

  -- Revoking.
  BEGIN
    PERFORM public.revoke_plan_role(leader, (SELECT id FROM public.plan_roles WHERE user_id = starosta AND faculty = 'TestPs3'));
    RAISE EXCEPTION 'Group starosta revoked the starosta';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  BEGIN
    PERFORM public.revoke_plan_role(starosta, (SELECT id FROM public.plan_roles WHERE user_id = admin));
    RAISE EXCEPTION 'Admin revoked outside ops';
  EXCEPTION WHEN no_data_found THEN NULL; END;
  PERFORM public.revoke_plan_role(starosta, leader_role);
  BEGIN
    PERFORM public.save_plan_items(leader, jsonb_build_array(jsonb_build_object('id', quiz->>'id',
      'revision', (SELECT revision FROM public.plan_items WHERE id = (quiz->>'id')::uuid), 'title', 'Po odebraniu roli')));
    RAISE EXCEPTION 'Revoked group starosta still writes';
  EXCEPTION WHEN no_data_found THEN NULL; END;

  -- Deleting an account removes its private entries; group entries stay without an author.
  DELETE FROM public.users WHERE id IN (student, leader);
  IF EXISTS (SELECT 1 FROM public.plan_items WHERE owner_id = student) THEN RAISE EXCEPTION 'Private entries survived'; END IF;
  IF (SELECT author_id FROM public.plan_items WHERE id = (quiz->>'id')::uuid) IS NOT NULL THEN
    RAISE EXCEPTION 'Group entry kept its deleted author'; END IF;

  IF has_table_privilege('anon', 'public.plan_items', 'SELECT') OR has_table_privilege('authenticated', 'public.plan_roles', 'SELECT')
     OR has_table_privilege('anon', 'public.plan_role_invites', 'SELECT') OR has_table_privilege('authenticated', 'public.plan_item_state', 'INSERT')
     OR has_table_privilege('anon', 'public.plan_item_history', 'SELECT')
     OR has_function_privilege('anon', 'public.save_plan_items(uuid,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.redeem_plan_role_invite(uuid,text)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.plan_can_write(uuid,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Plan entry grants leaked'; END IF;
END $$;
ROLLBACK;
\echo plan items test passed
