import "./ChatPanel.css";
import { useEffect, useRef } from "react";
import { Bot, Trash2 } from "lucide-react";
import SlotChoicesMessage from "./SlotChoicesMessage";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageContent({ message, isLoading }) {
  if (isLoading) {
    return "Zastanawiam się…";
  }

  if (message.role === "assistant") {
    const assistantText = (message.text || "").replace(/\s+$/g, "");

    return (
      <div className="leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p className="mb-1.5 last:mb-0" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 mb-1.5 last:mb-0" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 mb-1.5 last:mb-0" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-1 last:mb-0" {...props} />
            ),
            a: ({ node, children, href, ...props }) => (
              <a
                className="underline underline-offset-2 break-all"
                target="_blank"
                rel="noreferrer"
                href={href}
                {...props}
              >
                {children || href}
              </a>
            ),
            code: ({ node, inline, className, children, ...props }) =>
              inline ? (
                <code
                  className="px-1 py-0.5 rounded bg-neutral-700/80"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block p-2 rounded bg-neutral-950/80 overflow-x-auto"
                  {...props}
                >
                  {children}
                </code>
              ),
          }}
        >
          {assistantText}
        </ReactMarkdown>
      </div>
    );
  }

  return message.text;
}

export default function ChatPanel({
  isChatMode,
  isChatWindowOpen,
  scheduleName,
  status,
  clearConversation,
  error,
  resetError,
  messages,
  onAddSlot,
  addingEventId,
  addedEventIds,
  slotErrors,
}) {
  const messagesContainerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const previousMessagesMetaRef = useRef({
    count: 0,
    lastId: null,
    lastStage: null,
  });

  const SCROLL_BOTTOM_THRESHOLD = 56;

  const updateStickToBottom = (container) => {
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldStickToBottomRef.current =
      distanceToBottom <= SCROLL_BOTTOM_THRESHOLD;
  };

  const scrollToBottom = (container, behavior = "auto") => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    if (!isChatMode || !isChatWindowOpen) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    const frame = requestAnimationFrame(() => {
      scrollToBottom(container, "auto");
      updateStickToBottom(container);
    });
    return () => cancelAnimationFrame(frame);
  }, [isChatMode, isChatWindowOpen]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const previousMeta = previousMessagesMetaRef.current;

    const hasNewMessage = messages.length > previousMeta.count;
    const thinkingStarted =
      lastMessage?.stage === "loading" &&
      (lastMessage.id !== previousMeta.lastId ||
        previousMeta.lastStage !== "loading");

    const shouldAutoScroll =
      (hasNewMessage && lastMessage?.role === "user") ||
      thinkingStarted || shouldStickToBottomRef.current;

    previousMessagesMetaRef.current = {
      count: messages.length,
      lastId: lastMessage?.id ?? null,
      lastStage: lastMessage?.stage ?? null,
    };

    const frame = requestAnimationFrame(() => {
      if (shouldAutoScroll) {
        const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        scrollToBottom(container, reducedMotion ? "auto" : "smooth");
      }

      updateStickToBottom(container);
    });
    return () => cancelAnimationFrame(frame);
  }, [messages]);

  const handleMessagesScroll = (event) => {
    updateStickToBottom(event.currentTarget);
  };

  return (
    <section id="dock-chat-history" aria-label="Rozmowa z AI" className="dock-chat-panel">
      <div className="dock-chat-header">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Chat AI</p>
          <p className="truncate text-[11px] text-neutral-400">
            {scheduleName ? `Plan: ${scheduleName}` : "Asystent Twojego planu"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`dock-status-dot ${status === "sending" || status === "waiting" ? "is-busy" : status === "error" ? "is-error" : ""}`} aria-hidden="true" />
          <span className="sr-only" role="status">
            {status === "sending"
              ? "Wysyłanie…"
              : status === "waiting"
                ? "AI przygotowuje odpowiedź…"
                : status === "error"
                  ? "Błąd odpowiedzi"
                  : "Gotowy"}
          </span>

          <button
            type="button"
            onClick={clearConversation}
            className="h-8 w-8 rounded-full bg-neutral-800 text-neutral-200 flex items-center justify-center"
            aria-label="Wyczyść konwersację"
            title="Wyczyść konwersację"
            disabled={messages.length === 0 || status === "sending" || status === "waiting"}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="px-3 py-2 text-xs bg-rose-900/30 text-rose-200 border-b border-rose-800 flex items-center justify-between gap-3">
          <span role="alert">{error}</span>
          <button
            type="button"
            onClick={resetError}
            className="text-rose-100 underline underline-offset-2"
          >
            Zamknij
          </button>
        </div>
      ) : null}

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="dock-chat-messages flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2 floating-select-scrollbar"
        role="log"
        aria-label="Wiadomości"
        aria-live={isChatMode && isChatWindowOpen ? "polite" : "off"}
        aria-relevant="additions text"
        tabIndex={0}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-5 text-neutral-400">
            <Bot className="w-8 h-8 mb-2 text-neutral-500" />
            <p className="text-sm text-neutral-200">W czym mogę pomóc?</p>
            <p className="mt-1 text-xs">Zapytaj o zajęcia, wolne okienko lub termin odrobienia.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";
            const isLoading = message.stage === "loading";
            const isErrorMsg = message.stage === "error";

            const className = isUser
              ? "ml-10 bg-neutral-600 text-white rounded-br-md"
              : isErrorMsg
                ? "mr-10 bg-rose-900/40 border border-rose-700 text-rose-100"
                : "mr-10 bg-neutral-950 text-neutral-100 rounded-bl-md";

            const whitespaceClass = isUser
              ? "whitespace-pre-wrap"
              : "whitespace-normal";

            return (
              <div
                key={message.id}
                className={`rounded-2xl px-3 py-2 text-sm ${whitespaceClass} ${className}`}
              >
                {message?.payload?.ui?.type === "slot_choices" ? (
                  <SlotChoicesMessage
                    message={message}
                    onAddSlot={onAddSlot}
                    addingEventId={addingEventId}
                    addedEventIds={addedEventIds}
                    slotErrors={slotErrors}
                  />
                ) : (
                  <MessageContent message={message} isLoading={isLoading} />
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
