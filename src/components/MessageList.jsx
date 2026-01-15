import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function normalizeText(s) {
  s = (s || "").replace(/\r\n/g, "\n");
  return s.replace(/\n{2,}/g, "\n");
}

export default function MessageList({ messages, botName = "Assistant" }) {
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

        return (
          <div key={idx} className="msg-row">
            <div className="avatar">S</div>
            <div className="bubble bot">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                ol: ({ children }) => <ol style={{ margin: "0 0 0 18px" }}>{children}</ol>,
                li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
              }}
            >
              {normalizeText(m.text)}
            </ReactMarkdown>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
