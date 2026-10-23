#!/bin/sh
# Imports the nightly import and its alert workflow into an n8n container. Addresses are substituted here
# so they are never committed:  ALERT_EMAIL=you@example.com [ALERT_FROM=sender@example.com] ops/release/n8n-import.sh <container>
# A first import leaves both workflows inactive until the Postgres and SMTP credentials are selected in n8n.
# A re-import keeps the selected credentials and re-activates (with a container restart) what was active.
set -eu
: "${ALERT_EMAIL:?ALERT_EMAIL is required}"
from="${ALERT_FROM:-$ALERT_EMAIL}"
container="${1:?n8n container name is required}"
here="$(dirname "$0")"
tmp="$(mktemp)"
trap 'rm -f "$tmp"; docker exec "$container" rm -f /tmp/wieik-new.json /tmp/wieik-current.json /tmp/wieik-merged.json /tmp/wieik-keep.cjs' EXIT
sed -e "s|alert-recipient@example\.invalid|$ALERT_EMAIL|g" -e "s|alert-sender@example\.invalid|$from|g" \
  "$here/../../integrations/schedule-import/n8n-nightly.json" > "$tmp"
docker cp "$tmp" "$container:/tmp/wieik-new.json"
docker cp "$here/n8n-keep-credentials.cjs" "$container:/tmp/wieik-keep.cjs"
docker exec "$container" sh -c 'n8n export:workflow --all --output=/tmp/wieik-current.json >/dev/null 2>&1 || true'
active="$(docker exec "$container" node /tmp/wieik-keep.cjs /tmp/wieik-new.json /tmp/wieik-current.json /tmp/wieik-merged.json)"
docker exec "$container" n8n import:workflow --input=/tmp/wieik-merged.json
if [ -n "$active" ]; then
  for id in $active; do docker exec "$container" n8n update:workflow --id="$id" --active=true; done
  docker restart "$container" >/dev/null
  echo "Re-activated: $active (container restarted)"
fi
