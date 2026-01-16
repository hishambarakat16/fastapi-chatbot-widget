import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function normalizeText(s) {
  s = (s || "").replace(/\r\n/g, "\n");
  return s.replace(/\n{2,}/g, "\n");
}

export default function MessageList({ messages, botName = "Assistant", onFeedback, feedback = {} }) {

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="thread">
      {messages.map((m, idx) => {
        const isUser = m.role === "user";

        if (isUser) {
          return (
            <div key={idx} className="msg-row msg-right">
              <div className="bubble user">{m.text}</div>
            </div>
          );
        }

        const canFeedback = !!m.messageId;
        const chosen = m.messageId ? feedback[m.messageId] : null;

        return (
          <div key={idx} className="msg-row">
            <div className="avatar">S</div>

            <div className="bubble bot" style={{ position: "relative" }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                  ol: ({ children }) => <ol style={{ margin: "0 0 0 18px" }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
                }}
              >
                {normalizeText(m.text)}
              </ReactMarkdown>

              {/* Minimal feedback controls */}
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button
                  className={`btn btn-sm ${chosen === "thumbs_up" ? "btn-secondary" : "btn-outline-secondary"}`}
                  disabled={!canFeedback || !!chosen}
                  onClick={() => onFeedback?.({ feedback: "thumbs_up", messageId: m.messageId })}
                  title={canFeedback ? "Thumbs up" : "Missing message id"}
                  type="button"
                >
                  👍
                </button>

                <button
                  className={`btn btn-sm ${chosen === "thumbs_down" ? "btn-secondary" : "btn-outline-secondary"}`}
                  disabled={!canFeedback || !!chosen}
                  onClick={() => onFeedback?.({ feedback: "thumbs_down", messageId: m.messageId })}
                  title={canFeedback ? "Thumbs down" : "Missing message id"}
                  type="button"
                >
                  👎
                </button>
                
              </div>
            </div>
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}
