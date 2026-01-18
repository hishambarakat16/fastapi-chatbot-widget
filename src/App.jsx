// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
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

  const [theme, setTheme] = useState(initialTheme);
  const [authed, setAuthed] = useState(() => !!getToken());

  const [stage, setStage] = useState("idle");

  const [themeFading, setThemeFading] = useState(false);

  const [inspectorMounted, setInspectorMounted] = useState(true); 
  const [inspectorVisible, setInspectorVisible] = useState(true); 
  const [layoutMotion, setLayoutMotion] = useState("idle"); 

  useEffect(() => {
    setInspectorMounted(true);
    setInspectorVisible(true);
    setLayoutMotion("idle");
  }, []);

  useEffect(() => {
    setStage("idle");
    const r1 = requestAnimationFrame(() => setStage("header-in"));
    const t = setTimeout(() => setStage("body-in"), 140);
    return () => {
      cancelAnimationFrame(r1);
      clearTimeout(t);
    };
  }, [authed]);

  const sessionId = session?.session_id ?? null;

  const ctx = useMemo(
    () => ({
      session,
      sessionId,
      messages,
      status,
      showInspector: inspectorVisible,
      setShowInspector: (v) => {
        if (v) showInspector();
        else hideInspector();
      },
      setSession,
      setMessages,
      setStatus,
    }),
    [session, sessionId, messages, status, inspectorVisible],
  );

  function logout() {
    clearToken();
    setAuthed(false);
    setSession(null);
    setMessages([]);
    setStatus({ busy: false, error: null, traceId: null });

    setInspectorMounted(true);
    setInspectorVisible(true);
    setLayoutMotion("idle");
  }

  function updateTheme(nextTheme) {
    setThemeFading(true);
    requestAnimationFrame(() => {
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
      setTimeout(() => setThemeFading(false), 260);
    });
  }

  function hideInspector() {
    setLayoutMotion("closing");
    setInspectorVisible(false);
  }

  function showInspector() {
    setInspectorMounted(true);
    setLayoutMotion("opening");
    requestAnimationFrame(() => setInspectorVisible(true));
  }

  function onInspectorAnimationEnd(e) {
    if (e.currentTarget !== e.target) return;

    if (!inspectorVisible) {
      setInspectorMounted(false);
      setLayoutMotion("idle");
    } else {
      setLayoutMotion("idle");
    }
  }

  function toggleInspector() {
    if (inspectorVisible) hideInspector();
    else showInspector();
  }

  const headerIn = stage === "header-in" || stage === "body-in";
  const bodyIn = stage === "body-in";

  const isClosed = !inspectorVisible && layoutMotion !== "opening";

  return (
    <div className={["container py-4 app-shell", themeFading ? "theme-fade" : ""].join(" ")}>
      {/* Header enters first */}
      <div className={["enter enter-header", headerIn ? "in" : ""].join(" ")}>
        <HeaderBar
          title="FastAPI Chat Tester"
          showInspector={inspectorVisible}
          onToggleInspector={toggleInspector}
          theme={theme}
          onThemeChange={updateTheme}
          authed={authed}
          onLogout={logout}
        />
      </div>

      {/* Body enters after header */}
      <div className={["enter enter-body", bodyIn ? "in" : ""].join(" ")}>
        {!authed ? (
          <LoginPage brandName="FastAPI Chat Tester" onLoggedIn={() => setAuthed(true)} />
        ) : (
          <div
            className={[
              "devtools-layout",
              isClosed ? "is-closed" : "",
              layoutMotion === "opening" ? "is-opening" : "",
              layoutMotion === "closing" ? "is-closing" : "",
            ].join(" ")}
          >
            {/* LEFT: preview */}
            <div className="preview-col">
              <div className="preview-wrap">
                {/* ONLY THIS WRAPPER MOVES LEFT/RIGHT */}
                <div className="chat-mover">
                  <ChatPanel {...ctx} brandName="Fintech Company" botName="Speedy" />
                </div>
              </div>
            </div>

            {/* RIGHT: inspector + console */}
            {inspectorMounted ? (
              <div className="tools-col">
                <div
                  className={[
                    "tools-stack",
                    "inspector-bubble",
                    inspectorVisible ? "in" : "out",
                  ].join(" ")}
                  onAnimationEnd={onInspectorAnimationEnd}
                >
                  <div className="tools-top">
                    <SessionPanel {...ctx} />
                  </div>
                  <div className="tools-bottom">
                    <ConsolePanel />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
