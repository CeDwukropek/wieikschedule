-- Read-only. Run in the Supabase SQL editor and export this result as CSV.
-- Counts links per event, without user IDs, Firebase UIDs, reasons or tag labels.
-- This helps prioritize identity conflicts; zero links do not prove identity.
WITH additions AS (
  SELECT event_id,
    count(*) AS added_total,
    count(*) FILTER (WHERE status = 'active') AS added_active
  FROM public.user_added_events
  GROUP BY event_id
), tags AS (
  SELECT event_id, count(*) AS tag_total
  FROM public.user_event_tags
  GROUP BY event_id
)
SELECT e.id AS event_id,
  coalesce(a.added_total, 0) AS added_total,
  coalesce(a.added_active, 0) AS added_active,
  coalesce(t.tag_total, 0) AS tag_total
FROM public.events e
LEFT JOIN additions a ON a.event_id = e.id
LEFT JOIN tags t ON t.event_id = e.id
ORDER BY e.id;
