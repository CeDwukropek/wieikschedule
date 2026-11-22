import { useId, useRef } from 'react';
import { Info } from 'lucide-react';

// A small "i" next to a control; hovering it (or focusing it, also by a tap) explains what the control changes.
export function InfoTip({ label, text }) {
  const id = useId();
  return <span className="info-tip">
    <button type="button" className="info-tip-button" aria-label={`Co zmienia: ${label}`} aria-describedby={id}>
      <Info size={14} aria-hidden="true"/>
    </button>
    <span role="tooltip" id={id} className="info-tip-text">{text}</span>
  </span>;
}

// A switch between two or three choices: the chosen one sits under a sliding thumb. Arrow keys move it too.
// options: [{ value, label, icon? }]; info: what the choice changes, behind an "i".
export default function ChoiceSlider({ label, options, value, onChange, info, disabled }) {
  const labelId = useId();
  const track = useRef(null);
  const index = Math.max(0, options.findIndex(option => option.value === value));
  const move = step => {
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    track.current?.querySelectorAll('[role="radio"]')[next]?.focus();
  };
  const onKeyDown = event => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step || disabled) return;
    event.preventDefault();
    move(step);
  };
  return <div className="choice-slider">
    <div className="choice-slider-head">
      <span id={labelId}>{label}</span>
      {info && <InfoTip label={label} text={info}/>}
    </div>
    <div ref={track} role="radiogroup" aria-labelledby={labelId} className="choice-slider-track" onKeyDown={onKeyDown}
      style={{ '--count': options.length, '--index': index }}>
      <span className="choice-slider-thumb" aria-hidden="true"/>
      {options.map(option => {
        const Icon = option.icon;
        const checked = option.value === value;
        return <button key={String(option.value)} type="button" role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1}
          className="choice-slider-option" disabled={disabled} onClick={() => onChange(option.value)}>
          {Icon && <Icon size={15} aria-hidden="true"/>}<span>{option.label}</span>
        </button>;
      })}
    </div>
  </div>;
}
