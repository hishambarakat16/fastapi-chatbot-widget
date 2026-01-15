import React, { useMemo, useState } from "react";
import HeaderBar from "./components/HeaderBar.jsx";
import SessionPanel from "./components/SessionPanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import LoginPage from "./components/LoginPage.jsx";
import { clearToken, getToken } from "./api.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ busy: false, error: null, traceId: null });
  const [showInspector, setShowInspector] = useState(true);

  const [authed, setAuthed] = useState(() => !!getToken());

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

  function logout() {
    clearToken();
    setAuthed(false);
    setSession(null);
    setMessages([]);
    setStatus({ busy: false, error: null, traceId: null });
  }

  return (
    <div className="container py-4 app-shell">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="flex-grow-1">
          <HeaderBar
            title="FastAPI Chat Tester"
            hint="Dev proxy: /api → http://localhost:8000"
            showInspector={showInspector}
            onToggleInspector={() => setShowInspector((v) => !v)}
          />
        </div>

        {authed ? (
          <div className="pt-3">
            <button className="btn btn-sm btn-outline-danger" onClick={logout}>
              Logout
            </button>
          </div>
        ) : null}
      </div>

      {!authed ? (
        <LoginPage brandName="FastAPI Chat Tester" onLoggedIn={() => setAuthed(true)} />
      ) : (
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
      )}
    </div>
  );
}
