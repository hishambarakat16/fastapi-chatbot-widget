import React from "react";

export default function HeaderBar({
  title,
  hint,
  showInspector,
  onToggleInspector,
  authed = false,
  onLogout,
}) {
  return (
    <div className="topbar p-3 mb-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="d-flex flex-column">
          <div className="topbar-title h4 mb-1">{title}</div>
          <div className="small text-muted">{hint}</div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="kbd-hint">Ctrl+Enter</span>

          <button
            className={`btn btn-sm ${showInspector ? "btn-outline-secondary" : "btn-secondary"}`}
            onClick={onToggleInspector}
            type="button"
          >
            {showInspector ? "Hide inspector" : "Show inspector"}
          </button>

          {authed ? (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
