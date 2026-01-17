// fastapi-chat-tester/src/components/ChatPanel.jsx

import React, { useMemo, useState } from "react";
import { sendMessageStream, sendFeedback } from "../api.js";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";

export default function ChatPanel({
  brandName = "Customer Support",
  botName = "Assistant",
  sessionId,
  messages,
  setMessages,
  status,
  setStatus,
}) {
  const [draft, setDraft] = useState("");
  const [feedbackById, setFeedbackById] = useState({}); // { [messageId]: "thumbs_up" | "thumbs_down" }
  const [revealMs, setRevealMs] = useState(180);

  const hasSession = !!sessionId;

  const timeLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [hasSession, messages.length]);

  const welcomeText = useMemo(() => {
    return `Hi there. I’m ${botName}, ${brandName}’s virtual assistant. If you want to talk to a human agent at any time, type or tap “Talk to a human.”`;
  }, [botName, brandName]);

  // Always render through MessageList so the empty state matches the chat style
  const displayMessages = useMemo(() => {
    if (messages.length > 0) return messages;
    return [{ role: "assistant", text: welcomeText, ts: new Date().toISOString() }];
  }, [messages, welcomeText]);

  async function onSend(textOverride, { replaceAssistantAt } = {}) {
    const text = (textOverride ?? draft).trim();
    if (!text) return;

    if (!sessionId) {
      setStatus((prev) => ({
        ...prev,
        error: "No session. Start a session in the inspector first.",
      }));
      return;
    }

    if (replaceAssistantAt == null) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text, ts: new Date().toISOString() },
      ]);
      setDraft("");
    }

    // Create or replace assistant placeholder we will fill
    setMessages((prev) => {
      const next = prev.slice();

      if (replaceAssistantAt != null) {
        next[replaceAssistantAt] = {
          ...next[replaceAssistantAt],
          role: "assistant",
          text: "",
          ts: new Date().toISOString(),
          messageId: null,
          traceId: null,
        };
        return next;
      }

      next.push({ role: "assistant", text: "", ts: new Date().toISOString() });
      return next;
    });

    try {
      setStatus({ busy: true, error: null, traceId: null });

      const result = await sendMessageStream(sessionId, text, {
        onDelta: (_delta, full) => {
          setMessages((prev) => {
            const idx =
              replaceAssistantAt != null
                ? replaceAssistantAt
                : (() => {
                    for (let i = prev.length - 1; i >= 0; i--) {
                      if (prev[i].role === "assistant") return i;
                    }
                    return -1;
                  })();

            if (idx === -1) return prev;

            const next = prev.slice();
            next[idx] = { ...next[idx], text: full };
            return next;
          });
        },
      });

      // Attach messageId/traceId to the correct assistant message
      setMessages((prev) => {
        const idx =
          replaceAssistantAt != null
            ? replaceAssistantAt
            : (() => {
                for (let i = prev.length - 1; i >= 0; i--) {
                  if (prev[i].role === "assistant") return i;
                }
                return -1;
              })();

        if (idx === -1) return prev;

        const next = prev.slice();
        next[idx] = {
          ...next[idx],
          text: result?.text ?? next[idx].text,
          messageId: result?.messageId ?? null,
          traceId: result?.traceId ?? null,
        };
        return next;
      });

      setStatus({ busy: false, error: null, traceId: null });
    } catch (e) {
      setStatus({
        busy: false,
        error: e?.message || "send failed",
        traceId: null,
      });
    }
  }

  async function onFeedback({ feedback, messageId }) {
    if (!sessionId) return;
    if (!messageId) {
      setStatus((prev) => ({
        ...prev,
        error: "Cannot send feedback: missing messageId",
      }));
      return;
    }

    if (feedbackById[messageId]) return;

    // optimistic lock
    setFeedbackById((prev) => ({ ...prev, [messageId]: feedback }));

    try {
      await sendFeedback(sessionId, {
        feedback,
        message_id: messageId,
        reason: null,
        metadata: { source: "react_tester" },
      });
    } catch (e) {
      // rollback if failed
      setFeedbackById((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
      setStatus((prev) => ({ ...prev, error: e?.message || "feedback failed" }));
    }
  }

  function onRegenerateAssistant(atIndex) {
    // Find the closest user message before this assistant
    let userText = null;
    for (let i = atIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userText = messages[i].text;
        break;
      }
    }
    if (!userText) return;
    setMessages((prev) => prev.slice(0, atIndex + 1));
    onSend(userText, { replaceAssistantAt: atIndex });
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div>
          <div className="widget-brand">Support</div>
          <div className="widget-sub">{brandName}</div>
        </div>

        <div className="status-pill">
          <span className={`dot ${hasSession ? "on" : ""}`} />
          <span>{hasSession ? "Online" : "Offline"}</span>
        </div>
      </div>

      <div className="widget-body">
        <div className="time-marker">{timeLabel}</div>

        {!hasSession ? (
          <div className="alert alert-warning mb-3" role="alert">
            Start a session from the inspector to enable messaging.
          </div>
        ) : null}

        <MessageList
          messages={displayMessages}
          botName={botName}
          onFeedback={onFeedback}
          feedback={feedbackById}
          revealMs={revealMs}
          onRegenerate={onRegenerateAssistant}
        />

        {/* Quick action should match the user-bubble look */}
        {hasSession && messages.length === 0 ? (
          <div className="cw-row cw-right" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="cw-bubble cw-user"
              style={{ border: 0, cursor: "pointer" }}
              onClick={() => onSend("Talk to a human")}
              disabled={status.busy}
              aria-label="Quick action: Talk to a human"
            >
              Talk to a human
            </button>
          </div>
        ) : null}

        {status.error ? (
          <div className="alert alert-danger mt-2 mb-0" role="alert">
            <div className="fw-semibold">Error</div>
            <div className="small">{status.error}</div>
          </div>
        ) : null}
      </div>

      <div className="widget-footer">
        <MessageInput
          value={draft}
          onChange={setDraft}
          onSend={() => onSend()}
          disabled={status.busy || !hasSession}
        />
        <div className="small-muted mt-2">Ctrl+Enter to send.</div>

        <div className="revealCtl">
          <label className="small-muted">Reveal</label>
          <input
            type="range"
            min="80"
            max="420"
            step="20"
            value={revealMs}
            onChange={(e) => setRevealMs(Number(e.target.value))}
          />
          <span className="small-muted">{revealMs}ms</span>
        </div>
      </div>
    </div>
  );
}
