import { timeToMinutes } from "../utils";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEvents(events, rangeStartMinutes, rangeEndMinutes) {
  return events
    .map((ev, originalIndex) => {
      const rawStart = timeToMinutes(ev.start);
      const rawEnd = timeToMinutes(ev.end);
      const start = clamp(rawStart, rangeStartMinutes, rangeEndMinutes);
      const end = clamp(rawEnd, rangeStartMinutes, rangeEndMinutes);

      return {
        ev,
        originalIndex,
        start,
        end,
      };
    })
    .filter((item) => Number.isFinite(item.start) && Number.isFinite(item.end))
    .filter((item) => item.end > item.start)
    .sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      if (a.end !== b.end) return a.end - b.end;
      return a.originalIndex - b.originalIndex;
    });
}

function splitIntoOverlapClusters(sortedEvents) {
  const clusters = [];
  let currentCluster = [];
  let currentClusterEnd = -Infinity;

  sortedEvents.forEach((item) => {
    if (currentCluster.length === 0 || item.start < currentClusterEnd) {
      currentCluster.push(item);
      currentClusterEnd = Math.max(currentClusterEnd, item.end);
      return;
    }

    clusters.push(currentCluster);
    currentCluster = [item];
    currentClusterEnd = item.end;
  });

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters;
}

function assignColumns(cluster) {
  const columnEndTimes = [];
  let maxColumns = 0;

  const withColumns = cluster.map((item) => {
    let column = columnEndTimes.findIndex((end) => end <= item.start);
    if (column === -1) {
      column = columnEndTimes.length;
      columnEndTimes.push(item.end);
    } else {
      columnEndTimes[column] = item.end;
    }

    maxColumns = Math.max(maxColumns, columnEndTimes.length);

    return {
      ...item,
      column,
    };
  });

  return withColumns.map((item) => ({
    ...item,
    columnCount: maxColumns,
  }));
}

export function buildEventLayout(events, { startHour, endHour }) {
  const rangeStartMinutes = startHour * 60;
  const rangeEndMinutes = endHour * 60;

  const normalized = normalizeEvents(
    events,
    rangeStartMinutes,
    rangeEndMinutes,
  );
  const clusters = splitIntoOverlapClusters(normalized);

  return clusters
    .flatMap((cluster) => assignColumns(cluster))
    .map(({ ev, start, end, column, columnCount }) => ({
      ev,
      startMinutes: start,
      endMinutes: end,
      column,
      columnCount,
    }));
}
