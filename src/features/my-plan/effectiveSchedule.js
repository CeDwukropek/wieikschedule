import { normalizeTimetable } from '../schedule/data/normalizeTimetable';
import { mapAddedEvent } from './eventMappers';
export function applyPersonalOverrides(rows,overrides) {
  const lookup=new Map(overrides.map(o=>[o.event_id,o]));
  return rows.flatMap(row=>{
    const override=lookup.get(row.id||row.event_id);
    if(override?.action==='cancel')return [];
    return [{...row,...(override?.patch||{}),...(override?{personal_override:true}:{})}];
  });
}
export function effectiveTimetables(timetables,overrides) {
  return Object.fromEntries(Object.entries(timetables).map(([id,table])=>[id,
    Array.isArray(table.rawRows)?normalizeTimetable(id,applyPersonalOverrides(table.rawRows,overrides)):table]));
}
export function effectiveAddedEvents(events,overrides) {
  return events.flatMap(event=>{
    if(!event._raw)return overrides.some(o=>o.event_id===event.event_id&&o.action==='cancel')?[]:[event];
    return applyPersonalOverrides([{...event._raw,id:event.event_id}],overrides)
      .map(row=>mapAddedEvent(row)).filter(Boolean);
  });
}
