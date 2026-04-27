import { useMemo, useRef, useState } from "react";
import { sendN8nChatMessage } from "./n8nClient";
import { addEventToMyPlan } from "../myPlanApi";

function generateSessionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createMessage({
  role,
  text,
  stage = "done",
  errorCode = null,
  payload = null,
}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    stage,
    errorCode,
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function useChatbot({ scheduleName, selectedGroups, onMyPlanChanged }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [addingEventId, setAddingEventId] = useState(null);
  const [addedEventIds, setAddedEventIds] = useState(() => new Set());
  const [slotErrors, setSlotErrors] = useState({});
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
                text: reply.output,
                payload: reply,
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
    setAddingEventId(null);
    setAddedEventIds(new Set());
    setSlotErrors({});
    setStatus("idle");
  };

  const addSlotToMyPlan = async (slot) => {
    const eventId = String(slot?.event_id || "").trim();

    if (!eventId) {
      setSlotErrors((prev) => ({
        ...prev,
        "": "Nie udalo sie dodac tego terminu. Sprobuj ponownie.",
      }));
      return;
    }

    setSlotErrors((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    setAddingEventId(eventId);

    try {
      const response = await addEventToMyPlan(eventId);

      setAddedEventIds((prev) => {
        const next = new Set(prev);
        next.add(eventId);
        return next;
      });

      if (response?.already_added) {
        setSlotErrors((prev) => ({
          ...prev,
          [eventId]: "Ten termin jest juz w Twoim planie.",
        }));
      }

      if (typeof onMyPlanChanged === "function") {
        onMyPlanChanged();
      }
    } catch (addError) {
      setSlotErrors((prev) => ({
        ...prev,
        [eventId]:
          addError?.message ||
          "Nie udalo sie dodac tego terminu. Sprobuj ponownie.",
      }));
    } finally {
      setAddingEventId((current) => (current === eventId ? null : current));
    }
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
    addSlotToMyPlan,
    addingEventId,
    addedEventIds,
    slotErrors,
  };
}
