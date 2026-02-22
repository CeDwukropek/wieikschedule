import React, { useRef, useState } from "react";
import { splitTeacherDisplay } from "./utils";

export default function EventTooltipWrapper({ ev, children }) {
  const wrapperRef = useRef(null);
  const tooltipRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState("top");
  const [offsetX, setOffsetX] = useState(0);
  const longPressTimer = useRef(null);

  const positionTooltip = () => {
    const wr = wrapperRef.current?.getBoundingClientRect();
    const tt = tooltipRef.current?.getBoundingClientRect();
    if (!wr || !tt) return;

    const spaceAbove = wr.top;
    const spaceBelow = window.innerHeight - wr.bottom;
    const shouldPlaceTop =
      spaceAbove >= tt.height + 12 || spaceAbove >= spaceBelow;
    setPos(shouldPlaceTop ? "top" : "bottom");

    const overflowRight = wr.left + tt.width - window.innerWidth;
    let shift = overflowRight > 0 ? -(overflowRight + 8) : 0;
    const minLeftMargin = 8;
    if (wr.left + shift < minLeftMargin) {
      shift = shift + (minLeftMargin - (wr.left + shift));
    }
    setOffsetX(shift);
  };

  const show = () => {
    setVisible(true);
    requestAnimationFrame(positionTooltip);
  };

  const hide = () => {
    setVisible(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const onMouseEnter = () => show();
  const onMouseLeave = () => hide();
  const onFocus = () => show();
  const onBlur = () => hide();
  const onMouseMove = () => {
    if (visible) positionTooltip();
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape") hide();
  };
  const onTouchStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      show();
    }, 400);
  };
  const onTouchEnd = () => hide();
  const onTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const title = ev.title || ev.subj;
  const groups = Array.isArray(ev.groups) ? ev.groups.join(", ") : ev.groups;
  const teacherLines = splitTeacherDisplay(ev?.teacher);
  const transform = `translate(${offsetX}px, ${pos === "top" ? (visible ? "calc(-100% - 6px)" : "-100%") : visible ? "6px" : "0"})`;

  return (
    <div
      ref={wrapperRef}
      className="event-wrapper"
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
    >
      {children}
      <div
        ref={tooltipRef}
        className="event-tooltip"
        data-pos={pos}
        data-visible={visible ? "true" : "false"}
        style={{ transform }}
      >
        {title ? (
          <div className="row">
            <span className="label">Przedmiot:</span> <span>{title}</span>
          </div>
        ) : null}
        {ev.type ? (
          <div className="row">
            <span className="label">Typ:</span> <span>{ev.type}</span>
          </div>
        ) : null}
        {ev.start && ev.end ? (
          <div className="row">
            <span className="label">Czas:</span>{" "}
            <span>
              {ev.start} - {ev.end}
            </span>
          </div>
        ) : null}
        {ev.room ? (
          <div className="row">
            <span className="label">Sala:</span> <span>{ev.room}</span>
          </div>
        ) : null}
        {teacherLines.length ? (
          <div className="row">
            <span className="label">Prowadzący:</span>
            <span className="flex flex-col">
              {teacherLines.map((teacherLine) => (
                <span key={teacherLine}>{teacherLine}</span>
              ))}
            </span>
          </div>
        ) : null}
        {groups ? (
          <div className="row">
            <span className="label">Grupy:</span> <span>{groups}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
