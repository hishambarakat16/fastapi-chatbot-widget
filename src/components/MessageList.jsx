// fastapi-chat-tester/src/components/MessageList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

function normalizeText(s) {
  s = (s || "").replace(/\r\n/g, "\n");
  return s.replace(/\n{3,}/g, "\n\n");
}

// Chunking strategy: small groups of sentences / lines.
// You can tune this easily.
function splitIntoChunks(text) {
  const t = normalizeText(text).trim();
  if (!t) return [];

  // Split by blank lines first (nice for policy/retrieval answers)
  const blocks = t.split(/\n\s*\n/g);

  const chunks = [];
  const SENTENCES_PER_CHUNK = 1; // keep 2 as default

  for (const b of blocks) {
    const parts = b.split(/(?<=[.!?])\s+(?=[A-Z0-9"“‘(])/g);
    for (let i = 0; i < parts.length; i += SENTENCES_PER_CHUNK) {
      chunks.push(parts.slice(i, i + SENTENCES_PER_CHUNK).join(" "));
    }
  }
  return chunks.filter(Boolean);
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore (no UI changes to your error system)
    }
  }

  return (
    <button
      className="cw-iconbtn"
      type="button"
      onClick={onCopy}
      title={copied ? "Copied" : "Copy"}
      aria-label="Copy message"
    >
      {copied ? "✓" : "⧉"}
    </button>
  );
}

function AssistantBubble({
  m,
  botName,
  canFeedback,
  chosen,
  onFeedback,
}) {
  // Animate chunks when text changes
  const chunks = useMemo(() => splitIntoChunks(m.text), [m.text]);
  const [visibleN, setVisibleN] = useState(0);

  useEffect(() => {
    // reset + animate
    if (!chunks.length) {
      setVisibleN(0);
      return;
    }

    setVisibleN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisibleN((prev) => (prev < chunks.length ? prev + 1 : prev));
      if (i >= chunks.length) clearInterval(id);
    }, 180); // speed; tune 140–240

    return () => clearInterval(id);
  }, [chunks.length]);

  return (
    <div className="cw-bubble cw-bot">
      <div className="cw-meta">{botName}</div>

      <div className="cw-content">
        {chunks.slice(0, visibleN).map((c, idx) => (
          <div key={idx} className="cw-chunk">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                ol: ({ children }) => <ol style={{ margin: "0 0 0 18px" }}>{children}</ol>,
                li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
              }}
            >
              {c}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <div className="cw-actions">
        <CopyBtn text={m.text} />

        <button
          className={`cw-iconbtn ${chosen === "thumbs_up" ? "is-on" : ""}`}
          disabled={!canFeedback || !!chosen}
          onClick={() => onFeedback?.({ feedback: "thumbs_up", messageId: m.messageId })}
          title={canFeedback ? "Thumbs up" : "Missing message id"}
          type="button"
        >
          👍
        </button>

        <button
          className={`cw-iconbtn ${chosen === "thumbs_down" ? "is-on" : ""}`}
          disabled={!canFeedback || !!chosen}
          onClick={() => onFeedback?.({ feedback: "thumbs_down", messageId: m.messageId })}
          title={canFeedback ? "Thumbs down" : "Missing message id"}
          type="button"
        >
          👎
        </button>
      </div>
    </div>
  );
}

export default function MessageList({ messages, botName="Assistant", onFeedback, feedback={}, revealMs=180 }) {

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="cw-thread">
      {messages.map((m, idx) => {
        const isUser = m.role === "user";

        if (isUser) {
          return (
            <div key={idx} className="cw-row cw-right">
              <div className="cw-bubble cw-user">{m.text}</div>
            </div>
          );
        }

        const canFeedback = !!m.messageId;
        const chosen = m.messageId ? feedback[m.messageId] : null;

        return (
          <div key={idx} className="cw-row">
            <div className="cw-avatar">S</div>
            <AssistantBubble m={m} botName={botName} canFeedback={canFeedback} chosen={chosen} onFeedback={onFeedback} revealMs={revealMs} />

          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}
