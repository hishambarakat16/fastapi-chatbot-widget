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

  const hasSession = !!sessionId;

  const timeLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }, [hasSession, messages.length]);

  const [revealMs, setRevealMs] = useState(180);  
  
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

        {messages.length === 0 ? (
          <div className="msg-row">
            <div className="avatar">S</div>
            <div className="bubble bot">
              <div className="msg-meta">{botName}</div>
              Hi there. I’m {botName}, {brandName}’s virtual assistant. If you want
              to talk to an agent at any time, type or tap{" "}
              <strong>“Talk to a human.”</strong>
            </div>
          </div>
        ) : null}

        {hasSession && messages.length === 0 ? (
          <div className="quick-actions">
            <button
              className="quick-chip"
              onClick={() => onSend("Talk to a human")}
              disabled={status.busy}
            >
              Talk to a human
            </button>
          </div>
        ) : null}

        <MessageList messages={messages} botName={botName} onFeedback={onFeedback} feedback={feedbackById} revealMs={revealMs} onRegenerate={onRegenerateAssistant}/>


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
        <div className="revealCtl">
        <label className="small-muted">Reveal</label>
        <input type="range" min="80" max="420" step="20" value={revealMs} onChange={(e)=>setRevealMs(Number(e.target.value))} />
        <span className="small-muted">{revealMs}ms</span>
      </div>
      </div>
    </div>
  );
}
