#!/bin/sh
# Release sequence for the Supabase database. Runs inside postgres:17-bookworm with the repository at
# /repo (read-only) and the reviewed fresh-load changes at /plan/changes.json:
#   docker run --rm --env-file <file with DB_URL> -v "$PWD":/repo:ro -v <plan dir>:/plan:ro \
#     postgres:17-bookworm sh /repo/ops/release/apply.sh <step>
# Steps: check | identity | reload | private | verify | all. Every step stops at the first error.
set -eu
: "${DB_URL:?DB_URL is required}"
export PGOPTIONS="-c statement_timeout=0 -c lock_timeout=30s"
M=/repo/DB/migrations
run() { psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }

check() {
  # The fresh load needs a database without source identities or private references.
  run -At <<'SQL'
SELECT 'events=' || count(*) FROM public.events;
SELECT 'source_columns=' || count(*) FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events' AND column_name IN ('source_system', 'source_key');
SELECT 'user_added_events=' || count(*) FROM public.user_added_events;
SELECT 'user_event_tags=' || count(*) FROM public.user_event_tags;
SELECT 'service_role=' || count(*) FROM pg_roles WHERE rolname = 'service_role';
SQL
}
identity() {
  run -f "$M/20261014_wieik_import.sql"
  run -f "$M/20261015_unlinked_bootstrap.sql"
}
reload() {
  run -v changes_file=/plan/changes.json -f /repo/ops/release/fresh-load.sql
}
private() {
  for file in 20261015_personal_overrides 20261021_calendar_links 20261022_calendar_writes \
    20261023_plan_versions_and_hygiene 20261024_release_hardening; do
    echo "== $file"; run -f "$M/$file.sql"
  done
}
verify() {
  run -At <<'SQL'
SELECT 'events ' || coalesce(status, '<null>') || '=' || count(*) FROM public.events GROUP BY status ORDER BY 1;
SELECT 'without_source=' || count(*) FROM public.events WHERE source_system IS NULL;
SELECT 'plans=' || count(*) || ' max_rows_with_all=' || coalesce(max(n), 0) FROM (
  SELECT count(*) + (SELECT count(*) FROM public.events WHERE faculty = 'all' AND status IN ('aktywne', 'wolne')) AS n
  FROM public.events WHERE faculty <> 'all' AND status IN ('aktywne', 'wolne') GROUP BY faculty) AS plan;
SELECT 'timetable_versions=' || count(*) FROM public.timetable_versions;
SELECT 'anon_writable_tables=' || count(*) FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
  AND (has_table_privilege('anon', oid, 'INSERT,UPDATE,DELETE,TRUNCATE')
    OR has_table_privilege('authenticated', oid, 'INSERT,UPDATE,DELETE,TRUNCATE'));
SELECT 'anon_readable=' || string_agg(relname, ',' ORDER BY relname) FROM pg_class
  WHERE relnamespace = 'public'::regnamespace AND relkind = 'r' AND has_table_privilege('anon', oid, 'SELECT');
SELECT 'anon_executable_functions=' || count(*) FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace AND has_function_privilege('anon', oid, 'EXECUTE');
SELECT 'events_fk ' || conrelid::regclass || '=' || confdeltype::text FROM pg_constraint
  WHERE contype = 'f' AND confrelid = 'public.events'::regclass ORDER BY 1;
SQL
}

case "${1:-}" in
  check) check ;;
  identity) identity ;;
  reload) reload ;;
  private) private ;;
  verify) verify ;;
  all) check; identity; reload; private; verify ;;
  *) echo "usage: apply.sh check|identity|reload|private|verify|all" >&2; exit 64 ;;
esac
