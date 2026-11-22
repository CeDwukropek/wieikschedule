import { useId, useState } from 'react';
import { searchDirectory } from './browseLogic';

// A room or instructor typed in, as in the room and instructor search: the matching names of all plans show below
// while typing (any part of a word, without Polish letters); one is chosen by a click, or with the arrows and Enter.
// What was typed stays when nothing is chosen. The suggestions sit in the card's flow, so nothing pops out of it.
export default function DirectoryInput({ label, value, onChange, names, placeholder, loading, error }) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const entries = names.map(name => ({ key: name, label: name }));
  const matches = open && value.trim() ? searchDirectory(entries, value, 6).filter(entry => entry.label !== value) : [];
  const choose = name => { onChange(name); setOpen(false); };
  const onKeyDown = event => {
    if (!matches.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(previous => (previous + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
    } else if (event.key === 'Enter') { event.preventDefault(); choose(matches[Math.min(active, matches.length - 1)].label); }
    else if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); }
  };
  return <div className="directory-input">
    <input role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={matches.length > 0} aria-controls={listId}
      aria-activedescendant={matches.length ? `${listId}-${Math.min(active, matches.length - 1)}` : undefined}
      value={value} maxLength={256} placeholder={placeholder} autoComplete="off"
      onChange={event => { onChange(event.target.value); setOpen(true); setActive(0); }}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={onKeyDown}/>
    {open && value.trim() && <ul id={listId} role="listbox" aria-label={`Podpowiedzi: ${label}`}>
      {matches.map((entry, index) => <li key={entry.key} id={`${listId}-${index}`} role="option" aria-selected={index === Math.min(active, matches.length - 1)}
        // A press on a suggestion must not blur the field first (it would close the list before the click).
        onMouseDown={event => event.preventDefault()} onClick={() => choose(entry.label)}>{entry.label}</li>)}
      {!matches.length && (loading || error) && <li className="directory-input-hint">
        {error ? 'Podpowiedzi są chwilowo niedostępne.' : 'Wczytywanie podpowiedzi…'}</li>}
    </ul>}
  </div>;
}
