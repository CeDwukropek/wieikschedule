import { KINDS } from './planItemLogic';

const SCOPES = { all: 'Wszystkie', group: 'Grupowe', personal: 'Moje' };
// Which entries the plan shows: by audience and by kind. Kept with the other view settings.
export default function EntryFilter({ scope, hiddenKinds, onScope, onToggleKind }) {
  return <div className="entry-filter">
    <div className="entry-filter-scope" role="group" aria-label="Pokaż terminy">
      {Object.entries(SCOPES).map(([value, label]) => <button key={value} type="button" aria-pressed={scope === value}
        onClick={() => onScope(value)}>{label}</button>)}
    </div>
    <div className="entry-filter-kinds" role="group" aria-label="Rodzaje terminów">
      {Object.entries(KINDS).map(([kind, { label, color }]) => <button key={kind} type="button" style={{ '--kind': color }}
        aria-pressed={!hiddenKinds.includes(kind)} onClick={() => onToggleKind(kind)}>{label}</button>)}
    </div>
  </div>;
}
