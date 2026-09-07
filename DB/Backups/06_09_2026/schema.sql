


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_user_event_tag_ownership"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  tag_scope TEXT;
  tag_user_id UUID;
BEGIN
  SELECT scope, user_id
  INTO tag_scope, tag_user_id
  FROM tag_definitions
  WHERE id = NEW.tag_id;

  IF tag_scope IS NULL THEN
    RAISE EXCEPTION 'Tag does not exist';
  END IF;

  IF tag_scope = 'custom' AND tag_user_id <> NEW.user_id THEN
    RAISE EXCEPTION 'Custom tag does not belong to this user';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_user_event_tag_ownership"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "faculty" "text" NOT NULL,
    "date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "duration_min" integer DEFAULT 90 NOT NULL,
    "subject" "text" NOT NULL,
    "instructor" "text",
    "room" "text",
    "group" "text",
    "type" "text",
    "status" "text" DEFAULT 'aktywne'::"text"
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tag_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "scope" "text" NOT NULL,
    "key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "color_hex" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tag_definitions_check" CHECK (((("scope" = 'system'::"text") AND ("user_id" IS NULL)) OR (("scope" = 'custom'::"text") AND ("user_id" IS NOT NULL)))),
    CONSTRAINT "tag_definitions_color_hex_check" CHECK (("color_hex" ~ '^#[0-9A-Fa-f]{6}$'::"text")),
    CONSTRAINT "tag_definitions_scope_check" CHECK (("scope" = ANY (ARRAY['system'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."tag_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_added_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "reason" "text" DEFAULT 'makeup'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "removed_at" timestamp with time zone,
    "schedule_name" "text" NOT NULL,
    CONSTRAINT "user_added_events_reason_check" CHECK (("reason" = ANY (ARRAY['makeup'::"text", 'optional'::"text", 'manual'::"text"]))),
    CONSTRAINT "user_added_events_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'removed'::"text"])))
);


ALTER TABLE "public"."user_added_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_event_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "schedule_name" "text" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_event_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firebase_uid" "text" NOT NULL,
    "role" "text" DEFAULT 'student'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'admin'::"text", 'staff'::"text", 'starosta'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tag_definitions"
    ADD CONSTRAINT "tag_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_added_events"
    ADD CONSTRAINT "user_added_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_event_tags"
    ADD CONSTRAINT "user_event_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_firebase_uid_key" UNIQUE ("firebase_uid");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_events_faculty_date" ON "public"."events" USING "btree" ("faculty", "date");



CREATE INDEX "idx_tag_definitions_user_scope" ON "public"."tag_definitions" USING "btree" ("user_id", "scope");



CREATE INDEX "idx_user_event_tags_event" ON "public"."user_event_tags" USING "btree" ("event_id");



CREATE INDEX "idx_user_event_tags_lookup" ON "public"."user_event_tags" USING "btree" ("user_id", "schedule_name", "event_id");



CREATE INDEX "idx_user_event_tags_schedule" ON "public"."user_event_tags" USING "btree" ("user_id", "schedule_name");



CREATE UNIQUE INDEX "uniq_custom_tag_key_per_user" ON "public"."tag_definitions" USING "btree" ("user_id", "key") WHERE ("scope" = 'custom'::"text");



CREATE UNIQUE INDEX "uniq_system_tag_key" ON "public"."tag_definitions" USING "btree" ("key") WHERE (("scope" = 'system'::"text") AND ("user_id" IS NULL));



CREATE UNIQUE INDEX "uniq_user_added_event_active" ON "public"."user_added_events" USING "btree" ("user_id", "schedule_name", "event_id") WHERE ("status" = 'active'::"text");



CREATE UNIQUE INDEX "uniq_user_event_tag" ON "public"."user_event_tags" USING "btree" ("user_id", "schedule_name", "event_id", "tag_id");



CREATE OR REPLACE TRIGGER "trg_validate_user_event_tag_ownership" BEFORE INSERT OR UPDATE ON "public"."user_event_tags" FOR EACH ROW EXECUTE FUNCTION "public"."validate_user_event_tag_ownership"();



ALTER TABLE ONLY "public"."tag_definitions"
    ADD CONSTRAINT "tag_definitions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_added_events"
    ADD CONSTRAINT "user_added_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_added_events"
    ADD CONSTRAINT "user_added_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_event_tags"
    ADD CONSTRAINT "user_event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_event_tags"
    ADD CONSTRAINT "user_event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag_definitions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_event_tags"
    ADD CONSTRAINT "user_event_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Public read" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Public read system tag definitions" ON "public"."tag_definitions" FOR SELECT USING (("scope" = 'system'::"text"));



CREATE POLICY "Service role write" ON "public"."events" USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tag_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_added_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_event_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_user_event_tag_ownership"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_user_event_tag_ownership"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_user_event_tag_ownership"() TO "service_role";


















GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."tag_definitions" TO "anon";
GRANT ALL ON TABLE "public"."tag_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."tag_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."user_added_events" TO "anon";
GRANT ALL ON TABLE "public"."user_added_events" TO "authenticated";
GRANT ALL ON TABLE "public"."user_added_events" TO "service_role";



GRANT ALL ON TABLE "public"."user_event_tags" TO "anon";
GRANT ALL ON TABLE "public"."user_event_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."user_event_tags" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































