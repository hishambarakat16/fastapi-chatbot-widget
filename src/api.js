// fastapi-chat-tester/src/api.js

const TOKEN_KEY = "auth_token";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function mkMessageId() {
  return `m_${Math.random().toString(16).slice(2, 10)}`;
}

function apiUrl(path) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// OAuth2PasswordRequestForm expects x-www-form-urlencoded:
// username=...&password=...
export async function login(username, password) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const r = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.detail || data?.error || "login_failed");

  // expected: { access_token, token_type }
  if (data?.access_token) setToken(data.access_token);
  return data;
}

export async function createSession() {
  const r = await fetch(apiUrl("/v1/chat/session"), {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      metadata: { source: "react_tester" },
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data?.detail || data?.error || "create_session_failed");
  return data;
}

export async function deleteSession(sessionId) {
  const r = await fetch(
    apiUrl(`/v1/chat/session/${encodeURIComponent(sessionId)}`),
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data?.detail || data?.error || "delete_session_failed");
  return data;
}

export async function sendMessage(sessionId, text) {
  const r = await fetch(
    apiUrl(`/v1/chat/session/${encodeURIComponent(sessionId)}/message`),
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        content: text,
        metadata: { client_message_id: mkMessageId() },
      }),
    },
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(data?.detail || data?.error || "send_message_failed");
  return data;
}

export async function sendMessageStream(sessionId, text, { onDelta } = {}) {
  const r = await fetch(
    apiUrl(`/v1/chat/session/${encodeURIComponent(sessionId)}/message:stream`),
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        content: text,
        metadata: { client_message_id: mkMessageId() },
      }),
    },
  );

  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data?.detail || data?.error || "stream_failed");
  }

  const messageId = r.headers.get("x-message-id");
  const traceId = r.headers.get("x-trace-id");

  // Read full body (plain text)
  const fullText = await r.text();

  // Keep the same callback contract (single update)
  if (onDelta) onDelta(fullText, fullText);

  // Return text + ids so caller can attach to the assistant message
  return { text: fullText, messageId, traceId };
}

export async function sendFeedback(
  sessionId,
  { feedback, message_id, reason, metadata } = {},
) {
  const r = await fetch(
    apiUrl(`/v1/chat/session/${encodeURIComponent(sessionId)}/feedback`),
    {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        feedback,
        message_id,
        reason: reason ?? null,
        metadata: metadata ?? null,
      }),
    },
  );

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.detail || data?.error || "feedback_failed");
  return data;
}
