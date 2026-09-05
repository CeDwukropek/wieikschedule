import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  Menu,
  RotateCw,
  Check,
  LoaderCircle,
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
import "./FloatingMenu.css";
import { useChatbot } from "../chatbot/useChatbot";
import FloatingSelectionPanel from "./FloatingSelectionPanel";
import FloatingChatPanel from "./FloatingChatPanel";
import { ReactComponent as RoundedCorner } from "./Subtract.svg";

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
    isScheduleRefreshing = false,
    onRefreshSchedule,
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
    onOptimisticAddConfirmed,
  } = chatState || {};

  const [isChatMode, setIsChatMode] = useState(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(true);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [refreshNotice, setRefreshNotice] = useState(null);
  const dockRef = useRef(null);
  const inputRef = useRef(null);
  const aiButtonRef = useRef(null);
  const dateButtonRef = useRef(null);
  const backButtonRef = useRef(null);
  const composerId = useId();
  const refreshPendingRef = useRef(false);

  const dayActiveRef = useRef(null);
  const weekActiveRef = useRef(null);

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
    onOptimisticAddConfirmed,
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
    const active = isWeek ? weekActiveRef.current : dayActiveRef.current;
    const frame = requestAnimationFrame(() => {
      active?.scrollIntoView({ block: "nearest" });
      active?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectionOpen, isWeek]);

  useEffect(() => {
    if (!selectionOpen && !isChatMode) return;
    const handlePointer = (event) => {
      if (!dockRef.current?.contains(event.target)) {
        setSelectionOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key !== "Escape") return;
      if (selectionOpen) {
        setSelectionOpen(false);
        dateButtonRef.current?.focus();
      } else if (isChatWindowOpen) {
        setIsChatWindowOpen(false);
        dateButtonRef.current?.focus();
      } else {
        flushSync(() => setIsChatMode(false));
        backButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [selectionOpen, isChatMode, isChatWindowOpen]);

  useEffect(() => {
    if (!refreshNotice) return;
    const timer = setTimeout(() => setRefreshNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [refreshNotice]);

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

  const handleRefresh = async () => {
    if (refreshPendingRef.current || isScheduleLoading || isScheduleRefreshing) return;
    refreshPendingRef.current = true;
    setRefreshNotice(null);
    try {
      await onRefreshSchedule?.();
      setRefreshNotice({ kind: "success", text: "Plan jest aktualny" });
    } catch (refreshError) {
      setRefreshNotice({ kind: "error", text: refreshError.message || "Nie udało się odświeżyć planu." });
    } finally {
      refreshPendingRef.current = false;
    }
  };

  const closeSelection = () => {
    setSelectionOpen(false);
    dateButtonRef.current?.focus();
  };
  const chatActive = isAiChatEnabled && isChatMode;
  const historyExpanded = chatActive && isChatWindowOpen;
  const closeChat = () => {
    flushSync(() => setIsChatMode(false));
    // The right action can be disabled while it is the send button.
    backButtonRef.current?.focus();
  };
  const busy = status === "sending" || status === "waiting";
  const refreshing = isScheduleLoading || isScheduleRefreshing;
  const resetLabel = isWeek ? "Wróć do bieżącego tygodnia" : "Wróć do dzisiaj";
  const dateLabel = isWeek ? "Wybierz tydzień" : "Wybierz dzień";

  return (
    <div>
      <div
        ref={dockRef}
        className={`schedule-dock ${chatActive ? "is-chat" : ""} ${historyExpanded ? "is-expanded" : ""} ${!isAiChatEnabled ? "without-ai" : ""}`}
        style={{ "--keyboard-offset": `${keyboardOffset}px`, zIndex: isSettingsOpen ? 30 : 200 }}
        inert={isSettingsOpen ? true : undefined}
      >
        <div className="dock-notice" role="status" aria-live="polite">
          {refreshNotice && !chatActive && (
            <span className={`dock-notice-content ${refreshNotice.kind === "error" ? "is-error" : ""}`}>
              {refreshNotice.kind === "success" && <Check size={15} aria-hidden="true" />}
              {refreshNotice.text}
            </span>
          )}
        </div>

        <nav className="dock-navigation" aria-label="Nawigacja planu">
          <button
            ref={backButtonRef}
            type="button"
            className="dock-button dock-island dock-left-action"
            onClick={chatActive ? closeChat : handleRefresh}
            disabled={!chatActive && (refreshing || !currentSchedule || !onRefreshSchedule)}
            aria-label={chatActive ? "Wróć do nawigacji planu" : refreshing ? "Odświeżanie planu" : "Odśwież plan"}
            title={chatActive ? "Wróć do planu" : "Pobierz aktualny plan"}
            aria-busy={!chatActive && refreshing}
          >
            <span className="dock-icon dock-icon-default" aria-hidden="true">
              <RotateCw size={20} className={refreshing ? "dock-spin" : ""} />
            </span>
            <span className="dock-icon dock-icon-chat" aria-hidden="true">
              <ChevronRight size={23} />
            </span>
          </button>

          <div className="dock-center dock-island">
            <div className="dock-center-buttons" inert={chatActive ? true : undefined} aria-hidden={chatActive}>
              <button type="button" className="dock-button dock-edge-button"
                onClick={() => setViewMode(isWeek ? "day" : "week")}
                aria-label={isWeek ? "Przełącz na widok dnia" : "Przełącz na widok tygodnia"}
                title={isWeek ? "Widok dnia" : "Widok tygodnia"}>
                {isWeek ? <Calendar size={19} aria-hidden="true" /> : <List size={19} aria-hidden="true" />}
              </button>
              <button type="button" className="dock-button" onClick={handlePrev} disabled={!canGoPrev}
                aria-label={isWeek ? "Poprzedni tydzień" : "Poprzedni dzień"} title={isWeek ? "Poprzedni tydzień" : "Poprzedni dzień"}>
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button type="button" className="dock-button" onClick={handleReset}
                aria-label={resetLabel} title={isCurrent ? (isWeek ? "Bieżący tydzień" : "Dzisiaj") : resetLabel}>
                <span className={`dock-today-dot ${isCurrent ? "is-current" : ""}`} />
              </button>
              <button type="button" className="dock-button" onClick={handleNext} disabled={!canGoNext}
                aria-label={isWeek ? "Następny tydzień" : "Następny dzień"} title={isWeek ? "Następny tydzień" : "Następny dzień"}>
                <ChevronRight size={22} aria-hidden="true" />
              </button>
              <button type="button" className="dock-button dock-edge-button" aria-label="Otwórz menu" title="Menu i ustawienia"
                aria-expanded={isSettingsOpen} aria-controls="schedule-settings-panel"
                onClick={() => { setSelectionOpen(false); setIsSettingsOpen(true); }}>
                <Menu size={20} aria-hidden="true" />
              </button>
            </div>

            {isAiChatEnabled && (
              <form id={composerId} className="dock-composer"
                inert={!chatActive ? true : undefined} aria-hidden={!chatActive}
                onSubmit={(event) => { event.preventDefault(); handleChatSend(); }}>
                <input ref={inputRef} value={input} aria-label="Wiadomość do AI" placeholder="Zapytaj o swój plan…"
                  onChange={(event) => { if (status === "error") resetError(); setInput(event.target.value); }}
                  onKeyDown={(event) => { if (event.key === "Enter" && event.nativeEvent.isComposing) event.preventDefault(); }}
                  autoComplete="off" />
              </form>
            )}
          </div>

          {isAiChatEnabled && (
            <button ref={aiButtonRef} type={chatActive ? "submit" : "button"}
              form={chatActive ? composerId : undefined}
              className="dock-button dock-island dock-right-action"
              aria-label={chatActive ? "Wyślij wiadomość" : "Otwórz AI chat"}
              title={chatActive ? "Wyślij wiadomość" : "Zapytaj AI o plan"}
              disabled={chatActive && !canSend}
              onClick={(event) => {
                if (chatActive) return;
                // Keep the opening click from submitting the newly connected form.
                event.preventDefault();
                flushSync(() => {
                  setSelectionOpen(false);
                  setIsChatWindowOpen(true);
                  setIsChatMode(true);
                });
                inputRef.current?.focus({ preventScroll: true });
              }}>
              <span className="dock-accent">
                <span className="dock-icon dock-icon-default" aria-hidden="true"><Sparkles size={19} /></span>
                <span className="dock-icon dock-icon-chat" aria-hidden="true">
                  {busy ? <LoaderCircle size={19} className="dock-spin" /> : <SendHorizontal size={19} />}
                </span>
              </span>
            </button>
          )}
        </nav>

        <div className="dock-popover">
          <div className="dock-cap">
            <RoundedCorner className="dock-cap-corner dock-cap-corner-left" aria-hidden="true" />
            <RoundedCorner className="dock-cap-corner dock-cap-corner-right" aria-hidden="true" />
            <button
              ref={dateButtonRef}
              type="button"
              className="dock-tab"
              onClick={() => {
                if (chatActive) setIsChatWindowOpen((prev) => !prev);
                else setSelectionOpen((prev) => !prev);
              }}
              aria-label={chatActive ? (isChatWindowOpen ? "Zwiń chat" : "Rozwiń chat") : `${dateLabel}: ${label || ""}`}
              aria-expanded={chatActive ? isChatWindowOpen : selectionOpen}
              aria-controls={chatActive ? "dock-chat-history" : "dock-date-options"}
              title={chatActive ? (isChatWindowOpen ? "Zwiń rozmowę" : "Pokaż rozmowę") : dateLabel}
            >
              <span className="dock-cap-date" aria-hidden="true">
                <span>{label}</span>
                <ChevronDown size={12} className={selectionOpen ? "is-rotated" : ""} />
              </span>
              <ChevronUp size={23} className={`dock-cap-chevron ${historyExpanded ? "is-rotated" : ""}`} aria-hidden="true" />
            </button>
          </div>

          <FloatingSelectionPanel
            open={selectionOpen && !chatActive}
            isWeek={isWeek}
            options={options}
            selection={selection}
            onChange={onChange}
            currentDayValue={currentDayValue}
            dayActiveRef={dayActiveRef}
            weekOptions={weekOptions}
            weekSelectionValue={weekSelectionValue}
            onWeekChange={onWeekChange}
            weekActiveRef={weekActiveRef}
            onClose={closeSelection}
          />

          {isAiChatEnabled && (
            <div className="dock-history-popup"
              inert={!historyExpanded ? true : undefined} aria-hidden={!historyExpanded}>
              <FloatingChatPanel
                isChatMode={chatActive}
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
            </div>
          )}
        </div>

        {isAiChatEnabled && (
          <div className="dock-history-bridge" aria-hidden="true">
            <RoundedCorner className="dock-history-corner" />
          </div>
        )}

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
