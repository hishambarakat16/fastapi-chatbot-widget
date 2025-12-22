function mkMessageId() {
  return `m_${Math.random().toString(16).slice(2, 10)}`;
}

export async function createSession() {
  const r = await fetch("/api/v1/chat/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      metadata: { source: "react_tester" },
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data?.detail || data?.error || "create_session_failed");
  // { session_id, created_at }
  return data;
}

export async function deleteSession(sessionId) {
  const r = await fetch(
    `/api/v1/chat/session/${encodeURIComponent(sessionId)}`,
    {
      method: "DELETE",
    }
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data?.detail || data?.error || "delete_session_failed");
  return data; // { session_id, deleted }
}

export async function sendMessage(sessionId, text) {
  const r = await fetch(
    `/api/v1/chat/session/${encodeURIComponent(sessionId)}/message`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        metadata: { client_message_id: mkMessageId() },
      }),
    }
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data?.detail || data?.error || "send_message_failed");
  return data; // ChatMessageResponse (may be the stored user msg)
}

/**
 * Streams SSE from:
 * POST /v1/chat/session/{session_id}/message:stream
 * SSE format:
 *   data: token
 *   ...
 *   event: done
 *   data: [DONE]
 */

export async function sendMessageStream(sessionId, text, { onDelta } = {}) {
  const r = await fetch(
    `/api/v1/chat/session/${encodeURIComponent(sessionId)}/message:stream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        metadata: { client_message_id: mkMessageId() },
      }),
    }
  );

  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data?.detail || data?.error || "stream_failed");
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      // Keep leading spaces (do NOT trimStart). Only remove trailing CR if present.
      const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

      if (line.startsWith("data:")) {
        // Everything after "data:" is payload. We remove ONLY ONE optional space
        // (the one added by backend "data: {token}"), and preserve all other spaces.
        let data = line.slice(5);
        if (data.startsWith(" ")) data = data.slice(1);

        if (data === "[DONE]") {
          return fullText;
        }

        fullText += data;
        if (onDelta) onDelta(data, fullText);
      }
      // ignore event: done and other lines
    }
  }

  return fullText;
}
