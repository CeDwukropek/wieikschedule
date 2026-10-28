import { SUBJECT_PALETTE, isCustomColor } from "../schedule/logic/subjectColors";

// One colour per subject, chosen from the palette or the browser's own colour picker; "Auto" brings back the default.
export default function SubjectColors({ names, chosen = {}, onChoose }) {
  if (!names.length) return <p className="text-xs text-neutral-400">Wybierz plan, aby ustawić kolory przedmiotów.</p>;
  return <details className="subject-colors">
    <summary>Kolory przedmiotów{Object.keys(chosen).length ? ` (ustawione: ${names.filter(name => chosen[name]).length})` : ""}</summary>
    <ul>
      {names.map(name => <li key={name}>
        <span className="subject-colors-name">{name}</span>
        <div role="radiogroup" aria-label={`Kolor: ${name}`} className="subject-colors-swatches">
          <button type="button" role="radio" aria-checked={!chosen[name]} className="subject-colors-auto"
            onClick={() => onChoose(name, null)}>Auto</button>
          {SUBJECT_PALETTE.map(color => <button key={color.id} type="button" role="radio" aria-checked={chosen[name] === color.id}
            aria-label={color.label} title={color.label} className={color.className} onClick={() => onChoose(name, color.id)} />)}
          <label className="subject-colors-custom" title="Własny kolor" data-selected={isCustomColor(chosen[name]) || undefined}
            style={isCustomColor(chosen[name]) ? { background: chosen[name] } : undefined}>
            <input type="color" aria-label={`Własny kolor: ${name}`} value={isCustomColor(chosen[name]) ? chosen[name] : "#62f52b"}
              onChange={event => onChoose(name, event.target.value)} />
          </label>
        </div>
      </li>)}
    </ul>
  </details>;
}
