// src/App.jsx

import React, { useMemo, useState } from "react";
import HeaderBar from "./components/HeaderBar.jsx";
import SessionPanel from "./components/SessionPanel.jsx";
import ConsolePanel from "./components/ConsolePanel.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import LoginPage from "./components/LoginPage.jsx";
import { clearToken, getToken } from "./api.js";

export default function App({ initialTheme = "classic" }) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({ busy: false, error: null, traceId: null });
  const [showInspector, setShowInspector] = useState(true);
  const [theme, setTheme] = useState(initialTheme);

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
    [session, sessionId, messages, status, showInspector],
  );

  function logout() {
    clearToken();
    setAuthed(false);
    setSession(null);
    setMessages([]);
    setStatus({ busy: false, error: null, traceId: null });
  }

  function updateTheme(nextTheme) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  }

  return (
    <div className="container py-4 app-shell">
      <HeaderBar
        title="FastAPI Chat Tester"
        // hint="Dev proxy: /api → http://localhost:8000"
        showInspector={showInspector}
        onToggleInspector={() => setShowInspector((v) => !v)}
        theme={theme}
        onThemeChange={updateTheme}
        authed={authed}
        onLogout={logout}
      />

      {!authed ? (
        <LoginPage brandName="FastAPI Chat Tester" onLoggedIn={() => setAuthed(true)} />
      ) : (
        <div className="row g-3 align-items-start">
          <div className={`col-12 ${showInspector ? "col-lg-7" : "col-lg-12"}`}>
            <div className="d-flex justify-content-center">
              <div style={{ width: 420, maxWidth: "100%" }}>
                <ChatPanel {...ctx} brandName="Fintech Company" botName="Speedy" />
              </div>
            </div>
          </div>

          {/* RIGHT: inspector + console stacked (only when inspector is shown) */}
          {showInspector ? (
            <div className="col-12 col-lg-5">
              <div className="d-grid gap-3">
                <SessionPanel {...ctx} />
                <ConsolePanel />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
