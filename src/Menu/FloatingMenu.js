import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SendHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ControlsPanel from "../ControlsPanel";
import { ReactComponent as Substract } from "./Subtract.svg";
import { useChatbot } from "../chatbot/useChatbot";
import FloatingSelectionPanel from "./FloatingSelectionPanel";
import FloatingChatPanel from "./FloatingChatPanel";

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
  chatState,
}) {
  const { open: isSettingsOpen, setOpen: setIsSettingsOpen } = panelState || {};
  const [selectionOpen, setSelectionOpen] = useState(false);
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
    selection: weekSelectionValue,
    onChange: onWeekChange,
  } = weekSelection || {};
  const { options = [], selection, onChange } = daySelection || {};
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
    timetableOptions = [],
    timetableOptionsMessage = "",
    timetableDataSourceLabel = "",
    currentSchedule,
    isScheduleLoading = false,
    activeGroupSetId,
    activeGroupSetName,
    groupSetOptions = [],
    onGroupSetChange,
    onCreateGroupSet,
    onRenameActiveGroupSet,
    onDeleteActiveGroupSet,
    externalSelections = [],
    loadedTimetables = {},
    onAddExternalSelection,
    onUpdateExternalSelection,
    onRemoveExternalSelection,
    onScheduleChange,
  } = scheduleState || {};
  const {
    lektoratOptions = [],
    selectedLectoratSubject,
    onLectoratChange,
    shouldShowLectoratSelect,
  } = lektoratState || {};
  const { exportRef } = exportState || {};
  const {
    enabled: isAiChatEnabled = false,
    scheduleName,
    selectedGroups,
    onMyPlanChanged,
    onOptimisticAdd,
  } = chatState || {};

  const [isChatMode, setIsChatMode] = useState(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [selectionTab, setSelectionTab] = useState("day");

  const dayActiveRef = useRef(null);
  const weekActiveRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);

  const {
    input,
    setInput,
    messages,
    status,
    error,
    canSend,
    sendMessage,
    resetError,
    clearConversation,
    addSlotToMyPlan,
    addingEventId,
    addedEventIds,
    slotErrors,
  } = useChatbot({
    scheduleName,
    selectedGroups,
    onMyPlanChanged,
    onOptimisticAdd,
  });

  const isWeek = viewMode === "week";
  const label = isWeek ? viewedWeekRange : currentDayLabel;

  const handlePrev = isWeek ? onPrevWeek : onPrevDay;
  const handleReset = isWeek ? onResetWeek : onResetDay;
  const handleNext = isWeek ? onNextWeek : onNextDay;

  const canGoPrev = isWeek ? canGoPrevWeek : canGoPrevDay;
  const canGoNext = isWeek ? canGoNextWeek : canGoNextDay;
  const isCurrent = isWeek ? isCurrentWeek : isCurrentDay;

  const todayJsDay = new Date().getDay();
  const mondayFirstTodayIndex = (todayJsDay + 6) % 7;
  const currentDayValue =
    mondayFirstTodayIndex >= 0 && mondayFirstTodayIndex <= 4
      ? `0:${mondayFirstTodayIndex}`
      : null;

  useEffect(() => {
    if (!isChatMode) {
      setKeyboardOffset(0);
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateOffset = () => {
      const offset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      setKeyboardOffset(offset);
    };

    updateOffset();
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);

    return () => {
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
    };
  }, [isChatMode]);

  useEffect(() => {
    if (messages.length > 0) {
      setIsChatWindowOpen(true);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!selectionOpen) return;
    setSelectionTab(isWeek ? "week" : "day");
  }, [selectionOpen, isWeek]);

  useEffect(() => {
    if (!selectionOpen) return;

    const activeRef = selectionTab === "week" ? weekActiveRef : dayActiveRef;
    if (!activeRef.current) return;

    requestAnimationFrame(() => {
      activeRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  }, [selectionOpen, selectionTab, selection, weekSelectionValue]);

  useEffect(() => {
    if (!isChatMode) return;
    setSelectionOpen(false);
  }, [isChatMode]);

  useEffect(() => {
    if (isAiChatEnabled) return;
    setIsChatMode(false);
    setIsChatWindowOpen(false);
  }, [isAiChatEnabled]);

  const handleChatSend = async () => {
    if (!canSend) return;
    setIsChatWindowOpen(true);
    await sendMessage();
  };

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const startLabelPress = () => {
    longPressTriggeredRef.current = false;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setSelectionTab(isWeek ? "week" : "day");
      setSelectionOpen(true);
    }, 420);
  };

  const cancelLabelPress = () => {
    clearLongPressTimer();
  };

  const handleLabelClick = () => {
    clearLongPressTimer();
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    if (selectionOpen) {
      setSelectionOpen(false);
      return;
    }

    handleReset?.();
  };

  return (
    <div>
      <FloatingSelectionPanel
        open={selectionOpen}
        isChatMode={isChatMode}
        selectionTab={selectionTab}
        setSelectionTab={setSelectionTab}
        setViewMode={setViewMode}
        options={options}
        selection={selection}
        onChange={onChange}
        currentDayValue={currentDayValue}
        dayActiveRef={dayActiveRef}
        weekOptions={weekOptions}
        weekSelectionValue={weekSelectionValue}
        onWeekChange={onWeekChange}
        weekActiveRef={weekActiveRef}
        setSelectionOpen={setSelectionOpen}
      />

      <div
        className={`fixed inset-x-4 md:left-1/2 md:right-auto md:w-[min(92vw,460px)] md:-translate-x-1/2 ${isSettingsOpen ? "z-30" : "z-[200]"}`}
        style={{ bottom: `${16 + keyboardOffset}px` }}
      >
        <FloatingChatPanel
          isChatMode={isAiChatEnabled && isChatMode}
          isChatWindowOpen={isChatWindowOpen}
          scheduleName={scheduleName}
          status={status}
          clearConversation={clearConversation}
          error={error}
          resetError={resetError}
          messages={messages}
          onAddSlot={addSlotToMyPlan}
          addingEventId={addingEventId}
          addedEventIds={addedEventIds}
          slotErrors={slotErrors}
        />

        <div className="relative rounded-full border-none bg-neutral-950 px-3 py-3 shadow-2xl">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[100%]">
            <div className="absolute bottom-0 left-[-14px]">
              <Substract className="text-neutral-950" />
            </div>
            <div className="absolute bottom-0 right-[-14px]">
              <Substract className="text-neutral-950 [transform:scaleX(-1)]" />
            </div>

            {isAiChatEnabled && isChatMode ? (
              <button
                onClick={() => setIsChatWindowOpen((prev) => !prev)}
                aria-label={isChatWindowOpen ? "Zwiń chat" : "Rozwiń chat"}
                className="pointer-events-auto  -mb-[2px] inline-flex items-center gap-1 rounded-t-[1rem] border-none bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide text-neutral-300 shadow-lg border-b-neutral-950"
              >
                <span>AI Chat</span>
                {isChatWindowOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <button
                onMouseDown={startLabelPress}
                onMouseUp={cancelLabelPress}
                onMouseLeave={cancelLabelPress}
                onTouchStart={startLabelPress}
                onTouchEnd={cancelLabelPress}
                onTouchCancel={cancelLabelPress}
                onClick={handleLabelClick}
                aria-label={
                  isCurrent ? "Aktualny okres" : "Przejdź do bieżącego okresu"
                }
                className={`pointer-events-auto -mb-[3px] inline-flex items-center gap-1 rounded-t-[1rem] border-none bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide ${
                  isCurrent ? "text-lime-400" : "text-neutral-300"
                } shadow-lg border-b-neutral-950`}
              >
                <span>{label}</span>
                {selectionOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-neutral-950" />
          </div>

          {isAiChatEnabled && isChatMode ? (
            <div className="flex items-center gap-2">
              <button
                aria-label="Ukryj chat"
                onClick={() => setIsChatMode(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
              >
                <X className="h-5 w-5" strokeWidth={2.4} />
              </button>

              <input
                value={input}
                onChange={(e) => {
                  if (status === "error") resetError();
                  setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
                placeholder="Zapytaj AI o plan..."
                className="h-10 flex-1 rounded-full border border-neutral-700 bg-neutral-900 px-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
              />

              <button
                aria-label="Wyślij wiadomość"
                onClick={handleChatSend}
                disabled={!canSend}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95 disabled:opacity-40"
              >
                <SendHorizontal className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setViewMode(isWeek ? "day" : "week")}
                aria-label={
                  isWeek
                    ? "Przełącz na widok dnia"
                    : "Przełącz na widok tygodnia"
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

                {isAiChatEnabled ? (
                  <button
                    onClick={() => {
                      setSelectionOpen(false);
                      setIsChatMode(true);
                    }}
                    aria-label="Otwórz AI chat"
                    className="bg-lime-400 flex h-10 w-10 items-center justify-center rounded-full shadow-[0_0_16px_rgba(163,230,53,0.45)] transition hover:bg-lime-300 hover:shadow-[0_0_22px_rgba(163,230,53,0.62)] active:scale-95"
                  >
                    <Sparkles
                      className="h-5 w-5 text-neutral-950"
                      strokeWidth={2.4}
                    />
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    aria-label={
                      isCurrent
                        ? "Aktualny okres"
                        : "Przejdź do bieżącego okresu"
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
                )}

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
                aria-label="Otwórz ustawienia"
                onClick={() => {
                  setSelectionOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
              >
                <Menu className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ControlsPanel
        panelState={{
          isOpen: isSettingsOpen,
          onToggle: () => setIsSettingsOpen(false),
          mobileFloatingClose: true,
        }}
        scheduleState={{
          timetableOptions,
          timetableOptionsMessage,
          timetableDataSourceLabel,
          currentSchedule,
          onScheduleChange,
          isScheduleLoading,
        }}
        groupSetState={{
          activeGroupSetId,
          activeGroupSetName,
          groupSetOptions,
          onGroupSetChange,
          onCreateGroupSet,
          onRenameActiveGroupSet,
          onDeleteActiveGroupSet,
          externalSelections,
          loadedTimetables,
          onAddExternalSelection,
          onUpdateExternalSelection,
          onRemoveExternalSelection,
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
          selection,
          combinedOptions: options,
        }}
      />
    </div>
  );
}
