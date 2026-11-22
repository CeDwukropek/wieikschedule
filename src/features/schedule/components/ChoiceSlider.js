import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';

// A small "i" next to a control; hovering it, focusing it or tapping it explains what the control changes.
// The hint is placed against the screen, not the card (position: fixed): it never makes the card scroll down or
// sideways, stays inside the window and opens above the "i" when there is no room below.
const MARGIN = 8;
export function InfoTip({ label, text }) {
  const id = useId();
  const button = useRef(null), tip = useRef(null);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState(null);
  useLayoutEffect(() => {
    if (!open) { setPlace(null); return undefined; }
    const measure = () => {
      if (!button.current || !tip.current) return;
      const anchor = button.current.getBoundingClientRect();
      const width = Math.min(280, window.innerWidth - 2 * MARGIN);
      tip.current.style.width = `${width}px`;
      const height = tip.current.offsetHeight;
      const left = Math.min(Math.max(MARGIN, anchor.left + anchor.width / 2 - width / 2), window.innerWidth - width - MARGIN);
      const below = anchor.bottom + 6;
      const top = below + height + MARGIN <= window.innerHeight ? below : Math.max(MARGIN, anchor.top - 6 - height);
      setPlace({ top, left, width });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [open]);
  return <span className="info-tip" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button ref={button} type="button" className="info-tip-button" aria-label={`Co zmienia: ${label}`} aria-describedby={id}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={() => setOpen(true)}
      onKeyDown={event => { if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); } }}>
      <Info size={14} aria-hidden="true"/>
    </button>
    <span ref={tip} role="tooltip" id={id} className="info-tip-text" data-shown={place ? true : undefined}
      style={place ? { top: place.top, left: place.left, width: place.width } : undefined}>{text}</span>
  </span>;
}

// A switch between two or three choices: the chosen one sits under a sliding thumb. Arrow keys move it too.
// options: [{ value, label, icon? }]; info: what the choice changes, behind an "i".
// hideLabel: the label is only read out (the slider explains itself, e.g. next to a date).
export default function ChoiceSlider({ label, options, value, onChange, info, disabled, hideLabel }) {
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
    <div className={hideLabel ? 'sr-only' : 'choice-slider-head'}>
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
