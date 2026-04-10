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
  Bot,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ControlsPanel from "../ControlsPanel";
import { ReactComponent as Substract } from "./Subtract.svg";
import { useChatbot } from "../chatbot/useChatbot";

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
  const { scheduleName, selectedGroups } = chatState || {};

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
  } = useChatbot({
    scheduleName,
    selectedGroups,
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
      {selectionOpen && !isChatMode && (
        <div className="fixed bottom-28 left-1/2 z-[190] w-[min(92vw,460px)] -translate-x-1/2 rounded-3xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="p-3">
            <div className="mb-3 flex rounded-2xl bg-neutral-800 p-1">
              <button
                onClick={() => {
                  setSelectionTab("day");
                  setViewMode("day");
                }}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  selectionTab === "day"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400"
                }`}
              >
                Day
              </button>

              <button
                onClick={() => {
                  setSelectionTab("week");
                  setViewMode("week");
                }}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  selectionTab === "week"
                    ? "bg-neutral-700 text-white"
                    : "text-neutral-400"
                }`}
              >
                Week
              </button>
            </div>

            {selectionTab === "day" && options.length > 0 && onChange && (
              <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 floating-select-scrollbar">
                {options.map((option) => {
                  const active = option.value === selection;
                  const isCurrentOption = option.value === currentDayValue;

                  return (
                    <button
                      key={option.value}
                      ref={active ? dayActiveRef : null}
                      onClick={() => {
                        onChange(option.value);
                        setSelectionOpen(false);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? "bg-neutral-700 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate">{option.label}</div>
                          <div className="mt-0.5 text-xs text-neutral-400 truncate">
                            {option.date}
                          </div>
                        </div>
                        {isCurrentOption ? (
                          <span className="shrink-0 rounded-full bg-lime-500/20 px-2 py-0.5 text-[11px] font-medium text-lime-300">
                            Teraz
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectionTab === "week" &&
              weekOptions.length > 0 &&
              onWeekChange && (
                <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 floating-select-scrollbar">
                  {weekOptions.map((option) => {
                    const active =
                      Number(option.value) === Number(weekSelectionValue);
                    const isCurrentOption = Number(option.value) === 0;

                    return (
                      <button
                        key={option.value}
                        ref={active ? weekActiveRef : null}
                        onClick={() => {
                          onWeekChange(Number(option.value));
                          setSelectionOpen(false);
                        }}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                          active
                            ? "bg-neutral-700 text-white"
                            : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate">{option.label}</span>
                          {isCurrentOption ? (
                            <span className="shrink-0 rounded-full bg-lime-500/20 px-2 py-0.5 text-[11px] font-medium text-lime-300">
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
        className={`fixed inset-x-4 md:left-1/2 md:right-auto md:w-[min(92vw,460px)] md:-translate-x-1/2 ${isSettingsOpen ? "z-30" : "z-[200]"}`}
        style={{ bottom: `${16 + keyboardOffset}px` }}
      >
        {isChatMode && isChatWindowOpen ? (
          <div className="mb-3 h-[42vh] max-h-[360px] min-h-[220px] rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-neutral-700 bg-neutral-950/80 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Schedule Assistant
                </p>
                <p className="truncate text-[11px] text-neutral-400">
                  {scheduleName
                    ? `Plan: ${scheduleName}`
                    : "No schedule selected"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-300">
                  {status === "sending"
                    ? "Sending..."
                    : status === "waiting"
                      ? "Waiting..."
                      : status === "error"
                        ? "Error"
                        : "Ready"}
                </span>

                <button
                  type="button"
                  onClick={clearConversation}
                  className="h-8 w-8 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center"
                  aria-label="Wyczyść konwersację"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {error ? (
              <div className="px-3 py-2 text-xs bg-rose-900/30 text-rose-200 border-b border-rose-800 flex items-center justify-between gap-3">
                <span className="truncate">{error}</span>
                <button
                  type="button"
                  onClick={resetError}
                  className="text-rose-100 underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            ) : null}

            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-5 text-neutral-400">
                  <Bot className="w-8 h-8 mb-2 text-neutral-500" />
                  <p className="text-sm">Ask anything about your schedule.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isUser = message.role === "user";
                  const isLoading = message.stage === "loading";
                  const isErrorMsg = message.stage === "error";

                  const className = isUser
                    ? "ml-10 bg-white text-black"
                    : isErrorMsg
                      ? "mr-10 bg-rose-900/40 border border-rose-700 text-rose-100"
                      : "mr-10 bg-neutral-800 text-neutral-100";

                  return (
                    <div
                      key={message.id}
                      className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${className}`}
                    >
                      {isLoading ? "Thinking..." : message.text}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        <div className="relative rounded-full border-none bg-neutral-950 px-3 py-3 shadow-2xl">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[100%]">
            <div className="absolute bottom-0 left-[-14px]">
              <Substract className="text-neutral-950" />
            </div>
            <div className="absolute bottom-0 right-[-14px]">
              <Substract className="text-neutral-950 [transform:scaleX(-1)]" />
            </div>

            {isChatMode ? (
              <button
                onClick={() => setIsChatWindowOpen((prev) => !prev)}
                aria-label={isChatWindowOpen ? "Zwiń chat" : "Rozwiń chat"}
                className="pointer-events-auto -mb-[2px] inline-flex items-center gap-1 rounded-t-[1rem] border-none bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide text-neutral-300 shadow-lg border-b-neutral-950"
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
                className={`pointer-events-auto -mb-[2px] inline-flex items-center gap-1 rounded-t-[1rem] border-none bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide ${
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

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-950" />
          </div>

          {isChatMode ? (
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
          selection,
          combinedOptions: options,
        }}
      />
    </div>
  );
}
