import { normalizeTimetable } from '../schedule/data/normalizeTimetable';
import { mapAddedEvent } from './eventMappers';
// The university plan with a starosta's change for the whole group (groupChanges) and, on top, the person's own
// private change (overrides), which wins: a class the group cancelled still shows if the person changed it privately.
export function applyPersonalOverrides(rows,overrides,groupChanges=[]) {
  const own=new Map(overrides.map(o=>[o.event_id,o]));
  const group=new Map(groupChanges.map(change=>[change.event_id,change]));
  return rows.flatMap(row=>{
    const id=row.id||row.event_id;
    const override=own.get(id),change=group.get(id);
    if(override?.action==='cancel'||(!override&&change?.action==='cancel'))return [];
    return [{...row,...(change?.action==='modify'?change.patch:{}),...(override?.patch||{}),
      ...(override?{personal_override:true}:{}),...(change?{group_override:true}:{})}];
  });
}
export function effectiveTimetables(timetables,overrides,groupChanges=[]) {
  return Object.fromEntries(Object.entries(timetables).map(([id,table])=>[id,
    Array.isArray(table.rawRows)?normalizeTimetable(id,applyPersonalOverrides(table.rawRows,overrides,groupChanges)):table]));
}
export function effectiveAddedEvents(events,overrides,groupChanges=[]) {
  return events.flatMap(event=>{
    if(!event._raw)return overrides.some(o=>o.event_id===event.event_id&&o.action==='cancel')?[]:[event];
    return applyPersonalOverrides([{...event._raw,id:event.event_id}],overrides,groupChanges)
      .map(row=>mapAddedEvent(row)).filter(Boolean);
  });
}
