import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Trash2, X } from "lucide-react";
import { useChatbot } from "./useChatbot";

function StageBadge({ status }) {
  if (status === "sending") {
    return <span className="text-xs text-amber-300">Sending...</span>;
  }

  if (status === "waiting") {
    return (
      <span className="text-xs text-sky-300">Waiting for response...</span>
    );
  }

  if (status === "error") {
    return <span className="text-xs text-rose-300">Error</span>;
  }

  return <span className="text-xs text-emerald-300">Ready</span>;
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-5 text-neutral-400">
      <Bot className="w-8 h-8 mb-2 text-neutral-500" />
      <p className="text-sm">Ask anything about your schedule.</p>
      <p className="text-xs mt-1 text-neutral-500">
        The selected schedule is sent automatically.
      </p>
    </div>
  );
}

function MessageBubble({ message }) {
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
      className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-neutral-300">
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:120ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:240ms]" />
          </span>
          <span>Thinking...</span>
        </div>
      ) : (
        message.text
      )}
    </div>
  );
}

function MessagesList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (!messages.length) {
    return <EmptyState />;
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-3 space-y-2">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default function ChatPopup({ scheduleName, selectedGroups }) {
  const [open, setOpen] = useState(false);
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
  } = useChatbot({ scheduleName, selectedGroups });

  const scheduleLabel = useMemo(
    () => (scheduleName ? `Schedule: ${scheduleName}` : "No schedule selected"),
    [scheduleName],
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    await sendMessage();
  };

  return (
    <div className="fixed right-4 bottom-24 sm:bottom-5 z-[70]">
      {open && (
        <div className="w-[calc(100vw-2rem)] sm:w-[360px] h-[500px] max-h-[70vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl mb-3 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-neutral-700 bg-neutral-950/80 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Schedule Assistant
              </p>
              <p className="text-[11px] text-neutral-400">{scheduleLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <StageBadge status={status} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center justify-center"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {error ? (
            <div className="px-3 py-2 text-xs bg-rose-900/30 text-rose-200 border-b border-rose-800 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={resetError}
                className="text-rose-100 underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="flex-1 min-h-0">
            <MessagesList messages={messages} />
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-neutral-700 p-3 bg-neutral-950/70"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => {
                  if (status === "error") resetError();
                  setInput(event.target.value);
                }}
                placeholder="Ask about your schedule..."
                className="flex-1 h-10 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white px-3 outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!canSend}
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  canSend
                    ? "bg-sky-500 hover:bg-sky-400 text-white"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                }`}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
              <button
                type="button"
                onClick={clearConversation}
                className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center"
                aria-label="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="ml-auto w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-400 text-white shadow-xl flex items-center justify-center"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
