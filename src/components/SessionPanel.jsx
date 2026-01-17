import React from "react";
import { createSession, deleteSession } from "../api.js";

export default function SessionPanel({
  session,
  sessionId,
  status,
  setSession,
  setMessages,
  setStatus,
}) {
  async function onNewSession() {
    try {
      setStatus({ busy: true, error: null, traceId: null });
      const s = await createSession();
      setSession(s);
      setMessages([]);
      setStatus({ busy: false, error: null, traceId: null });
    } catch (e) {
      setStatus({ busy: false, error: e?.message || "failed", traceId: null });
    }
  }

  async function onDeleteSession() {
    if (!sessionId) return;
    try {
      setStatus({ busy: true, error: null, traceId: null });
      await deleteSession(sessionId);
      setSession(null);
      setMessages([]);
      setStatus({ busy: false, error: null, traceId: null });
    } catch (e) {
      setStatus({ busy: false, error: e?.message || "failed", traceId: null });
    }
  }

  function onResetUI() {
    setMessages([]);
    setStatus((prev) => ({ ...prev, error: null, traceId: null }));
  }

  return (
    <div className="card card-glass h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div>
            <h5 className="card-title mb-1">Inspector</h5>
            <div className="small text-muted">
              Session + debug info. The customer widget is on the left.
            </div>
          </div>
          <span className="badge text-bg-light">Local</span>
        </div>

        <div className="d-grid gap-2 my-3">
          <button className="btn btn-primary" onClick={onNewSession} disabled={status.busy}>
            {status.busy ? "Working..." : "Start new session"}
          </button>

          <button className="btn btn-outline-secondary" onClick={onResetUI} disabled={status.busy}>
            Reset UI (keep session)
          </button>

          <button
            className="btn btn-outline-danger"
            onClick={onDeleteSession}
            disabled={status.busy || !sessionId}
          >
            Delete session
          </button>
        </div>

        <div className="mb-3">
          <div className="small text-muted">Session ID</div>
          <div className="font-monospace">{sessionId || "—"}</div>
        </div>

        <div className="mb-3">
          <div className="small text-muted">Created At</div>
          <div className="font-monospace">{session?.created_at || "—"}</div>
        </div>
{/* 
        <div className="small text-muted">
          Tip: “Hide inspector” makes it look like a real customer widget.
        </div> */}
      </div>
    </div>
  );
}
