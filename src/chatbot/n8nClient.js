const DEFAULT_TIMEOUT_MS = 150000;

export class ChatbotApiError extends Error {
  constructor(message, code = "CHATBOT_API_ERROR") {
    super(message);
    this.name = "ChatbotApiError";
    this.code = code;
  }
}

function getEndpoint() {
  return (process.env.REACT_APP_N8N_CHAT_WEBHOOK || "").trim();
}

function withTimeout(signal, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener("abort", abort);
    },
  };
}

function normalizeResponsePayload(payload) {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    const first = payload.find(Boolean);
    return normalizeResponsePayload(first);
  }

  if (payload && typeof payload === "object") {
    const candidate =
      payload.reply ||
      payload.response ||
      payload.answer ||
      payload.output ||
      payload.message ||
      payload.text;

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function normalizeSelectedGroups(selectedGroups) {
  if (!selectedGroups || typeof selectedGroups !== "object") {
    return {};
  }

  return Object.entries(selectedGroups).reduce((acc, [type, value]) => {
    const cleanType = String(type || "").trim();
    const cleanValue = String(value || "").trim();

    if (!cleanType || !cleanValue) {
      return acc;
    }

    acc[cleanType] = cleanValue;
    return acc;
  }, {});
}

export async function sendN8nChatMessage({
  message,
  scheduleName,
  selectedGroups,
  sessionId,
  signal,
}) {
  const endpoint = getEndpoint();

  if (!endpoint) {
    throw new ChatbotApiError(
      "Missing webhook URL. Set REACT_APP_N8N_CHAT_WEBHOOK.",
      "CHATBOT_NOT_CONFIGURED",
    );
  }

  const timeoutScope = withTimeout(signal, DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: timeoutScope.signal,
      body: JSON.stringify({
        message,
        context: {
          scheduleName,
          selectedGroups: normalizeSelectedGroups(selectedGroups),
          sessionId: String(sessionId || "").trim() || undefined,
        },
        metadata: {
          source: "wieikschedule-web",
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new ChatbotApiError(
        `Request failed with status ${response.status}.`,
        "CHATBOT_HTTP_ERROR",
      );
    }

    const contentType = response.headers.get("content-type") || "";
    let payload;

    if (contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    const reply = normalizeResponsePayload(payload);

    if (!reply) {
      throw new ChatbotApiError(
        "Could not read chatbot response.",
        "CHATBOT_BAD_RESPONSE",
      );
    }

    return reply;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ChatbotApiError(
        "Request timeout. Try again.",
        "CHATBOT_TIMEOUT",
      );
    }

    if (error instanceof ChatbotApiError) {
      throw error;
    }

    throw new ChatbotApiError(
      "Could not connect to chatbot. Check your network and try again.",
      "CHATBOT_NETWORK_ERROR",
    );
  } finally {
    timeoutScope.cleanup();
  }
}
