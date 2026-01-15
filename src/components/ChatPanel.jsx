import React, { useMemo, useState } from "react";
import { sendMessageStream } from "../api.js";
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
  const hasSession = !!sessionId;

  const timeLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [hasSession, messages.length]);

  async function onSend(textOverride) {
    const text = (textOverride ?? draft).trim();
    if (!text) return;

    if (!sessionId) {
      setStatus((prev) => ({ ...prev, error: "No session. Start a session in the inspector first." }));
      return;
    }

    // Append user message
    setMessages((prev) => [...prev, { role: "user", text, ts: new Date().toISOString() }]);
    setDraft("");

    // Append assistant placeholder we will stream into
    const assistantIndex = messages.length + 1; // approximate next index after setMessages
    setMessages((prev) => [...prev, { role: "assistant", text: "", ts: new Date().toISOString() }]);

    try {
      setStatus({ busy: true, error: null, traceId: null });

      await sendMessageStream(sessionId, text, {
        onDelta: (_delta, full) => {
          setMessages((prev) => {
            const idx = (() => {
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

      setStatus({ busy: false, error: null, traceId: null });
    } catch (e) {
      setStatus({ busy: false, error: e?.message || "send failed", traceId: null });
    }
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div>
          <div className="widget-brand">{brandName}</div>
          <div className="widget-sub">{botName} · Virtual assistant</div>
        </div>

        <div className="status-pill">
          <span className={`dot ${hasSession ? "on" : ""}`} />
          <span>{hasSession ? "Online" : "No session"}</span>
        </div>
      </div>

      <div className="widget-body">
        <div className="time-marker">{timeLabel}</div>

        {!hasSession ? (
          <div className="alert alert-warning mb-3" role="alert">
            Start a session from the inspector to enable messaging.
          </div>
        ) : null}

        {messages.length === 0 ? (
          <div className="msg-row">
            <div className="avatar">S</div>
            <div className="bubble bot">
              <div className="msg-meta">{botName}</div>
              Hi there. I’m {botName}, {brandName}’s virtual assistant. If you want to talk to an agent at any time,
              type or tap <strong>“Talk to a human.”</strong>
            </div>
          </div>
        ) : null}

        {hasSession && messages.length === 0 ? (
          <div className="quick-actions">
            <button className="quick-chip" onClick={() => onSend("Talk to a human")} disabled={status.busy}>
              Talk to a human
            </button>
          </div>
        ) : null}

        <MessageList messages={messages} botName={botName} />

        <div className="small-muted mt-2">{status.busy ? "Sending..." : ""}</div>

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
      </div>
    </div>
  );
}
