import React, { useState } from "react";
import { login } from "../api.js";

export default function LoginPage({ brandName = "FastAPI Chat Tester", onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      onLoggedIn?.();
    } catch (err) {
      setError(err?.message || "login_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen d-flex justify-content-center align-items-center">
      <div className="card card-glass" style={{ width: 420, maxWidth: "100%" }}>
        <div className="card-body text-start">
          <h4 className="mb-1">{brandName}</h4>
          <div className="text-muted small mb-3">Login to start a chat session.</div>

          <form onSubmit={onSubmit} className="d-grid gap-2">
            <div>
              <label className="form-label small mb-1">Email</label>
              <input
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>

            <div>
              <label className="form-label small mb-1">Password</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={busy}
              />
            </div>

            {error ? (
              <div className="alert alert-danger mb-0" role="alert">
                <div className="fw-semibold">Login failed</div>
                <div className="small">{error}</div>
              </div>
            ) : null}

            <button className="btn btn-primary mt-2" type="submit" disabled={busy || !email || !password}>
              {busy ? "Signing in..." : "Sign in"}
            </button>

            <div className="small text-muted mt-2">
              You must be authenticated before creating a session or sending messages.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
