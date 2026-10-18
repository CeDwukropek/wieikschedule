const labels={exercise:'Ćwiczenia',lecture:'Wykłady',laboratory:'Laboratoria',project:'Projekty',language:'Lektoraty',other:'Inne'};
function endTime(event){
  const [hours,minutes]=event.start_time.split(':').map(Number);
  const end=hours*60+minutes+event.duration_min;
  return `${String(Math.floor(end/60)%24).padStart(2,'0')}:${String(end%60).padStart(2,'0')}`;
}
export default function SchedulePlanMessage({plan}){
  const days=new Map();
  for(const event of plan.events){
    if(!days.has(event.date))days.set(event.date,[]);
    days.get(event.date).push(event);
  }
  return <div className="schedule-plan-message">
    <p className="font-semibold">{plan.kind?labels[plan.kind]:'Twój plan'}</p>
    <p className="text-xs text-neutral-400">{plan.date_from} — {plan.date_to}</p>
    {plan.exclude_kinds?.length>0&&<p className="text-xs text-neutral-400">Bez: {plan.exclude_kinds.map(kind=>labels[kind]).join(', ')}</p>}
    {!plan.events.length&&<p className="mt-2">W tym zakresie nie znaleziono zajęć pasujących do filtrów.</p>}
    {[...days].map(([date,events])=><section key={date} className="mt-4" aria-label={`Zajęcia ${date}`}>
      <h4 className="mb-2 text-sm font-semibold capitalize">{new Intl.DateTimeFormat('pl-PL',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Warsaw'}).format(new Date(date+'T12:00:00Z'))}</h4>
      <ol className="space-y-2">
        {events.map(event=><li key={event.id} className="rounded-lg border border-neutral-700 px-3 py-2">
          <p className="font-semibold tabular-nums text-sky-200"><time dateTime={`${event.date}T${event.start_time}`}>{event.start_time.slice(0,5)}</time>–{endTime(event)}</p>
          <p className="mt-0.5 font-medium">{event.subject}</p>
          <p className="mt-1 text-xs text-neutral-300">{event.type||'Zajęcia'} · grupa {event.group||'wszystkie'}</p>
          <p className="text-xs text-neutral-300">Sala: {event.room||'nie podano'}</p>
          {event.instructor&&<p className="mt-1 text-xs text-neutral-400">{event.instructor}</p>}
        </li>)}
      </ol>
    </section>)}
    {plan.next_offset!==null&&plan.next_offset!==undefined&&<p className="mt-3 text-xs text-amber-200">Pokazano {plan.events.length} z {plan.total} zajęć. Poproś o kolejną stronę.</p>}
  </div>;
}
