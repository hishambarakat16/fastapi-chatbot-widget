import React, { useMemo, useState } from "react";
import HeaderBar from "./components/HeaderBar.jsx";
import SessionPanel from "./components/SessionPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";

export default function App() {
  const [session, setSession] = useState(null); // { sessionId, expiresAt }
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", text, ts }
  const [status, setStatus] = useState({ busy: false, error: null, traceId: null });
  const [showInspector, setShowInspector] = useState(true);

  const sessionId = session?.session_id ?? null;

  const ctx = useMemo(
    () => ({
      session,
      sessionId,
      messages,
      status,
      showInspector,
      setShowInspector,
      setSession,
      setMessages,
      setStatus,
    }),
    [session, sessionId, messages, status, showInspector]
  );

  return (
    <div className="container py-4 app-shell">
      <HeaderBar
        title="FastAPI Chat Tester"
        hint="Dev proxy: /api → http://localhost:8000"
        showInspector={showInspector}
        onToggleInspector={() => setShowInspector((v) => !v)}
      />

      <div className="row g-3 align-items-start">
        <div className={`col-12 ${showInspector ? "col-lg-7" : "col-lg-12"}`}>
          <div className="d-flex justify-content-center">
            <div style={{ width: 420, maxWidth: "100%" }}>
              <ChatPanel {...ctx} brandName="Ridgewood Auto" botName="Speedy" />
            </div>
          </div>
        </div>

        {showInspector ? (
          <div className="col-12 col-lg-5">
            <SessionPanel {...ctx} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
