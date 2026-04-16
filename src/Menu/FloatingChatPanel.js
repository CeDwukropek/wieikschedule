import { useEffect, useRef } from "react";
import { Bot, Trash2 } from "lucide-react";

export default function FloatingChatPanel({
  isChatMode,
  isChatWindowOpen,
  scheduleName,
  status,
  clearConversation,
  error,
  resetError,
  messages,
}) {
  const messagesContainerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

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
    if (!isChatWindowOpen) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      scrollToBottom(container, "auto");
      updateStickToBottom(container);
    });
  }, [isChatWindowOpen]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      if (shouldStickToBottomRef.current) {
        scrollToBottom(container, "smooth");
      }

      updateStickToBottom(container);
    });
  }, [messages, status, isChatWindowOpen]);

  const handleMessagesScroll = (event) => {
    updateStickToBottom(event.currentTarget);
  };

  if (!isChatMode || !isChatWindowOpen) return null;

  return (
    <div className="mb-3 h-[42vh] max-h-[360px] min-h-[220px] rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-neutral-700 bg-neutral-950/80 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Schedule Assistant</p>
          <p className="truncate text-[11px] text-neutral-400">
            {scheduleName ? `Plan: ${scheduleName}` : "No schedule selected"}
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

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2"
      >
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
  );
}
