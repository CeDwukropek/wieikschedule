import { useEffect, useState } from "react";
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
import { ReactComponent as Substract } from "../Menu/Subtract.svg";
import { useChatbot } from "../chatbot/useChatbot";

export function FloatingBottomNavigation({
  viewMode,
  setViewMode,
  options = [],
  selection,
  onChange,

  onPrevWeek,
  onResetWeek,
  onNextWeek,
  viewedWeekRange = "",
  isCurrentWeek = false,
  canGoPrevWeek = true,
  canGoNextWeek = true,

  onPrevDay,
  onResetDay,
  onNextDay,
  currentDayLabel = "",
  isCurrentDay = false,
  canGoPrevDay = true,
  canGoNextDay = true,

  open,
  setOpen,

  chatScheduleName,
  chatSelectedGroups,
}) {
  const [isChatMode, setIsChatMode] = useState(false);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

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
    scheduleName: chatScheduleName,
    selectedGroups: chatSelectedGroups,
  });

  const isWeek = viewMode === "week";

  const label = isWeek ? viewedWeekRange : currentDayLabel;

  const handlePrev = isWeek ? onPrevWeek : onPrevDay;
  const handleReset = isWeek ? onResetWeek : onResetDay;
  const handleNext = isWeek ? onNextWeek : onNextDay;

  const canGoPrev = isWeek ? canGoPrevWeek : canGoPrevDay;
  const canGoNext = isWeek ? canGoNextWeek : canGoNextDay;
  const isCurrent = isWeek ? isCurrentWeek : isCurrentDay;

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

  const handleChatSend = async () => {
    if (!canSend) return;
    setIsChatWindowOpen(true);
    await sendMessage();
  };

  return (
    <>
      {open && (
        <div className="sm:hidden fixed bottom-28 z-40 rounded-3xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
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

            {viewMode === "day" && options.length > 0 && onChange && (
              <div className="space-y-2">
                {options.map((option) => {
                  const active = option.value === selection;

                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                        active
                          ? "bg-neutral-700 text-white"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className="sm:hidden fixed inset-x-4 z-50"
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
                  {chatScheduleName
                    ? `Plan: ${chatScheduleName}`
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
                  const isError = message.stage === "error";

                  const className = isUser
                    ? "ml-10 bg-white text-black"
                    : isError
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
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[100%]">
            <div className="absolute bottom-0 left-[-7px]">
              <Substract className="text-neutral-950" />
            </div>
            <div className="absolute bottom-0 right-[-7px]">
              <Substract className="text-neutral-950 [transform:scaleX(-1)]" />
            </div>

            {isChatMode ? (
              <button
                onClick={() => setIsChatWindowOpen((prev) => !prev)}
                aria-label={isChatWindowOpen ? "Zwiń chat" : "Rozwiń chat"}
                className="-mb-[2px] inline-flex items-center gap-1 rounded-t-[1rem] border-none bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide text-neutral-300 shadow-lg border-b-neutral-950"
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
                onClick={handleReset}
                aria-label={
                  isCurrent ? "Aktualny okres" : "Przejdź do bieżącego okresu"
                }
                className={`-mb-[2px] rounded-t-[1rem] border-none bg-neutral-950 px-5 pt-2 text-center text-xs tracking-wide ${isCurrent ? 'text-lime-400' : 'text-neutral-300'} shadow-lg border-b-neutral-950`}
              >
                {label}
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
                  onClick={() => setIsChatMode(true)}
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
                aria-label={open ? "Zamknij menu" : "Otwórz menu"}
                onClick={() => setOpen((s) => !s)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg transition hover:bg-neutral-700 active:scale-95"
              >
                {open ? (
                  <X className="h-5 w-5" strokeWidth={2.4} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={2.4} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
