#!/bin/sh
# Imports the nightly import and its alert workflow into an n8n container. Both stay inactive until
# the Postgres and SMTP credentials are selected in n8n. Addresses are substituted here so they are
# never committed:  ALERT_EMAIL=you@example.com [ALERT_FROM=sender@example.com] ops/release/n8n-import.sh <container>
set -eu
: "${ALERT_EMAIL:?ALERT_EMAIL is required}"
from="${ALERT_FROM:-$ALERT_EMAIL}"
container="${1:?n8n container name is required}"
source="$(dirname "$0")/../../integrations/schedule-import/n8n-nightly.json"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
sed -e "s|alert-recipient@example\.invalid|$ALERT_EMAIL|" -e "s|alert-sender@example\.invalid|$from|" "$source" > "$tmp"
docker cp "$tmp" "$container:/tmp/wieik-nightly.json"
docker exec "$container" n8n import:workflow --input=/tmp/wieik-nightly.json
docker exec "$container" rm -f /tmp/wieik-nightly.json
