import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, botName = "Assistant" }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="thread">
      {messages.map((m, idx) => {
        const isUser = m.role === "user";
        const ts = m.ts ? new Date(m.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

        if (isUser) {
          return (
            <div key={idx} className="msg-row msg-right">
              <div className="bubble user">
                <div className="msg-meta">You {ts ? `· ${ts}` : ""}</div>
                {m.text}
              </div>
            </div>
          );
        }

        return (
          <div key={idx} className="msg-row">
            <div className="avatar">S</div>
            <div className="bubble bot">
              <div className="msg-meta">{botName} {ts ? `· ${ts}` : ""}</div>
              {m.text}
            </div>
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}
