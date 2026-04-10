import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ControlsPanel from "../ControlsPanel";
import { ReactComponent as Substract } from "../Menu/Subtract.svg";

export default function FloatingMenu({
  panelState,
  viewState,
  groupState,
  weekNavigation,
  weekSelection,
  daySelection,
  dayNavigation,
  filtering,
  scheduleState,
  lektoratState,
  exportState,
}) {
  const { open, setOpen } = panelState || {};
  const {
    viewMode,
    setViewMode,
    hideLectures,
    setHideLectures,
    showAll,
    setShowAll,
  } = viewState || {};
  const {
    studentGroups,
    groupConfigs = [],
    handleGroupChange,
  } = groupState || {};
  const {
    onPrevWeek,
    onResetWeek,
    onNextWeek,
    viewedWeekRange,
    isCurrentWeek,
    canGoPrevWeek,
    canGoNextWeek,
  } = weekNavigation || {};
  const {
    options: weekOptions = [],
    selection: selectedWeekOffset,
    onChange: onWeekChange,
  } = weekSelection || {};
  const {
    options: dayOptions = [],
    selection: selectedDay,
    onChange: onDayChange,
  } = daySelection || {};
  const {
    onPrevDay,
    onResetDay,
    onNextDay,
    currentDayLabel,
    isCurrentDay,
    canGoPrevDay,
    canGoNextDay,
  } = dayNavigation || {};
  const { computeFiltered } = filtering || {};
  const {
    schedule,
    currentSchedule,
    activeGroupSetId,
    activeGroupSetName,
    groupSetOptions = [],
    onGroupSetChange,
    onCreateGroupSet,
    onRenameActiveGroupSet,
    onDeleteActiveGroupSet,
    onScheduleChange,
  } = scheduleState || {};
  const {
    lektoratOptions = [],
    selectedLectoratSubject,
    onLectoratChange,
    shouldShowLectoratSelect,
  } = lektoratState || {};
  const { exportRef } = exportState || {};
  const activeDayRef = useRef(null);
  const activeWeekRef = useRef(null);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const selectionPressTimerRef = useRef(null);
  const selectionLongPressRef = useRef(false);

  const isWeek = viewMode === "week";
  const label = isWeek ? viewedWeekRange : currentDayLabel;
  const handlePrev = isWeek ? onPrevWeek : onPrevDay;
  const handleReset = isWeek ? onResetWeek : onResetDay;
  const handleNext = isWeek ? onNextWeek : onNextDay;
  const canGoPrev = isWeek ? canGoPrevWeek : canGoPrevDay;
  const canGoNext = isWeek ? canGoNextWeek : canGoNextDay;
  const isCurrent = isWeek ? isCurrentWeek : isCurrentDay;

  useEffect(() => {
    if (!selectionOpen) return;

    const activeRef = viewMode === "day" ? activeDayRef : activeWeekRef;
    if (!activeRef.current) return;

    activeRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [selectionOpen, viewMode, selectedDay, selectedWeekOffset]);

  useEffect(() => {
    if (open) {
      setSelectionOpen(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (selectionPressTimerRef.current) {
        window.clearTimeout(selectionPressTimerRef.current);
      }
    };
  }, []);

  const clearSelectionPressTimer = () => {
    if (selectionPressTimerRef.current) {
      window.clearTimeout(selectionPressTimerRef.current);
      selectionPressTimerRef.current = null;
    }
  };

  const openSelection = () => {
    clearSelectionPressTimer();
    selectionLongPressRef.current = true;
    setOpen(false);
    setSelectionOpen(true);
  };

  const handleSelectionPointerDown = () => {
    selectionLongPressRef.current = false;
    clearSelectionPressTimer();

    selectionPressTimerRef.current = window.setTimeout(() => {
      openSelection();
    }, 450);
  };

  const handleSelectionPointerUp = () => {
    clearSelectionPressTimer();
  };

  const handleSelectionClick = () => {
    if (selectionLongPressRef.current) {
      selectionLongPressRef.current = false;
      return;
    }

    setSelectionOpen(false);
    handleReset?.();
  };

  return (
    <>
      <ControlsPanel
        panelState={{
          isOpen: open,
          onToggle: () => setOpen(false),
          mobileFloatingClose: true,
        }}
        scheduleState={{
          currentSchedule,
          onScheduleChange,
        }}
        groupSetState={{
          activeGroupSetId,
          activeGroupSetName,
          groupSetOptions,
          onGroupSetChange,
          onCreateGroupSet,
          onRenameActiveGroupSet,
          onDeleteActiveGroupSet,
        }}
        viewState={{
          viewMode,
          onViewModeToggle: () =>
            setViewMode((prev) => (prev === "week" ? "day" : "week")),
          hideLectures,
          onToggleHideLectures: () => setHideLectures((prev) => !prev),
          showAll,
          onToggleShowAll: () => setShowAll((prev) => !prev),
        }}
        filterState={{
          schedule,
          studentGroups,
          computeFiltered,
          groupConfigs,
          onGroupChange: handleGroupChange,
        }}
        lektoratState={{
          shouldShowLectoratSelect,
          selectedLectoratSubject,
          onLectoratChange,
          lektoratOptions,
        }}
        exportState={{
          exportRef,
          viewedWeekRange,
          selection: selectedDay,
          combinedOptions: dayOptions,
        }}
      />

      {selectionOpen && (
        <div className="fixed bottom-28 left-4 right-4 z-[190] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-xl sm:left-1/2 sm:right-auto sm:w-[26rem] sm:-translate-x-1/2">
          <div className="p-3">
            <div className="mb-3 flex rounded-2xl bg-neutral-800 p-1">
              <button
                onClick={() => setViewMode("day")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  viewMode === "day"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400"
                }`}
              >
                Day
              </button>

              <button
                onClick={() => setViewMode("week")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  viewMode === "week"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400"
                }`}
              >
                Week
              </button>
            </div>

            {viewMode === "day" && dayOptions.length > 0 && onDayChange && (
              <div className="floating-select-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
                {dayOptions.map((option) => {
                  const active = option.value === selectedDay;
                  const isCurrentOption =
                    option.value === selectedDay && isCurrentDay;

                  return (
                    <button
                      key={option.value}
                      ref={active ? activeDayRef : null}
                      onClick={() => {
                        onDayChange(option.value);
                        setOpen(false);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? isCurrentOption
                            ? "border border-lime-400/40 bg-lime-400/10 text-white shadow-[0_0_18px_rgba(163,230,53,0.12)]"
                            : "bg-neutral-700 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{option.label}</div>
                        {isCurrentOption ? (
                          <span className="rounded-full bg-lime-400/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-lime-300">
                            Teraz
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={`text-xs ${isCurrentOption ? "text-lime-200/80" : "text-neutral-400"}`}
                      >
                        {option.date}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {viewMode === "week" && weekOptions.length > 0 && onWeekChange && (
              <div className="floating-select-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
                {weekOptions.map((option) => {
                  const active = option.value === selectedWeekOffset;
                  const isCurrentOption = option.value === 0;

                  return (
                    <button
                      key={option.value}
                      ref={active ? activeWeekRef : null}
                      onClick={() => {
                        onWeekChange(option.value);
                        setOpen(false);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? isCurrentOption
                            ? "border border-lime-400/40 bg-lime-400/10 text-white shadow-[0_0_18px_rgba(163,230,53,0.12)]"
                            : "bg-neutral-700 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{option.label}</span>
                        {isCurrentOption ? (
                          <span className="rounded-full bg-lime-500/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-lime-300">
                            Teraz
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-4 left-4 right-4 ${open ? "z-30" : "z-[200]"} sm:left-1/2 sm:right-auto sm:w-[32rem] sm:-translate-x-1/2`}
      >
        <div className="relative rounded-full border-none bg-neutral-950 px-3 py-3 shadow-2xl">
          <button
            type="button"
            onPointerDown={handleSelectionPointerDown}
            onPointerUp={handleSelectionPointerUp}
            onPointerLeave={handleSelectionPointerUp}
            onPointerCancel={handleSelectionPointerUp}
            onClick={handleSelectionClick}
            aria-label={
              selectionOpen
                ? "Wybór dni i tygodni"
                : "Przytrzymaj, aby wybrać dzień lub tydzień"
            }
            className="group absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-[100%] items-end"
          >
            <div className="absolute bottom-0 left-[-14px] pointer-events-none">
              <Substract className="text-neutral-950" />
            </div>
            <div className="absolute bottom-0 right-[-14px] pointer-events-none">
              <Substract className="text-neutral-950 [transform:scaleX(-1)]" />
            </div>
            <div
              className={`flex items-center gap-2 rounded-t-[1rem] border-none px-5 pt-2 text-center text-xs tracking-wide shadow-lg border-b-neutral-950 transition group-active:translate-y-[1px] ${
                isCurrent
                  ? "bg-neutral-950 text-lime-300"
                  : "bg-neutral-950 text-neutral-300"
              }`}
            >
              <span className="max-w-[11rem] truncate">{label}</span>
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  selectionOpen ? "rotate-[-90deg]" : "rotate-90"
                } ${isCurrent ? "text-lime-300" : "text-neutral-400"}`}
                strokeWidth={2.6}
              />
            </div>
          </button>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setViewMode(isWeek ? "day" : "week")}
              aria-label={
                isWeek ? "Przełącz na widok dnia" : "Przełącz na widok tygodnia"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
            >
              {isWeek ? (
                <Calendar className="h-5 w-5" strokeWidth={2.4} />
              ) : (
                <List className="h-5 w-5" strokeWidth={2.4} />
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Poprzedni"
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-100 transition hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
              </button>

              <button
                onClick={handleReset}
                aria-label={
                  isCurrent ? "Aktualny okres" : "Przejdź do bieżącego okresu"
                }
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-800 active:scale-95"
              >
                <span
                  className={`h-3 w-3 rounded-full ${
                    isCurrent
                      ? "bg-lime-400 shadow-[0_0_18px_rgba(163,230,53,0.6)]"
                      : "bg-neutral-500"
                  }`}
                />
              </button>

              <button
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Następny"
                className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-100 transition hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.6} />
              </button>
            </div>

            <button
              aria-label={open ? "Zamknij menu" : "Otwórz menu"}
              onClick={() => {
                setOpen((s) => !s);
                setSelectionOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
            >
              {open ? (
                <X className="h-5 w-5" strokeWidth={2.4} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.4} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
