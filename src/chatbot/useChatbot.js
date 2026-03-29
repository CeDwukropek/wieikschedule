import { useMemo, useRef, useState } from "react";
import { sendN8nChatMessage } from "./n8nClient";

function generateSessionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMessage({ role, text, stage = "done", errorCode = null }) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    stage,
    errorCode,
    createdAt: new Date().toISOString(),
  };
}

export function useChatbot({ scheduleName, selectedGroups }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const sessionIdRef = useRef(generateSessionId());

  const canSend = useMemo(
    () =>
      input.trim().length > 0 && status !== "sending" && status !== "waiting",
    [input, status],
  );

  const sendMessage = async () => {
    const cleanInput = input.trim();
    if (!cleanInput || !canSend) return;

    const userMessage = createMessage({ role: "user", text: cleanInput });
    const loadingMessage = createMessage({
      role: "assistant",
      text: "Thinking...",
      stage: "loading",
    });

    setInput("");
    setError(null);
    setStatus("sending");
    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setStatus("waiting");

      const reply = await sendN8nChatMessage({
        message: cleanInput,
        scheduleName,
        selectedGroups,
        sessionId: sessionIdRef.current,
        signal: controller.signal,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                text: reply,
                stage: "done",
                errorCode: null,
              }
            : msg,
        ),
      );
      setStatus("idle");
    } catch (apiError) {
      const fallbackMessage = "Sorry, I could not answer that right now.";
      const errorText = apiError?.message || fallbackMessage;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                text: errorText,
                stage: "error",
                errorCode: apiError?.code || "CHATBOT_UNKNOWN_ERROR",
              }
            : msg,
        ),
      );

      setError(errorText);
      setStatus("error");
    } finally {
      abortRef.current = null;
    }
  };

  const resetError = () => {
    if (status === "error") {
      setStatus("idle");
    }
    setError(null);
  };

  const clearConversation = () => {
    setMessages([]);
    setInput("");
    setError(null);
    setStatus("idle");
  };

  const cancelPending = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  return {
    input,
    setInput,
    messages,
    status,
    error,
    canSend,
    sendMessage,
    resetError,
    clearConversation,
    cancelPending,
  };
}
