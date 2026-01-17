import React, { useEffect, useMemo, useRef, useState } from "react";

function nowTs() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function safeStringify(v) {
  try {
    if (typeof v === "string") return v;
    if (v instanceof Error) return v.stack || v.message || String(v);
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function joinArgs(args) {
  return args.map((a) => safeStringify(a)).join(" ");
}

export default function ConsolePanel() {
  const [entries, setEntries] = useState([]); // { id, level, ts, text }
  const [level, setLevel] = useState("all"); // all | log | info | warn | error
  const [autoScroll, setAutoScroll] = useState(true);
  const boxRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => {
    const original = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    function push(level, args) {
      const text = joinArgs(args);
      const id = ++idRef.current;

      setEntries((prev) => {
        const next = prev.length >= 400 ? prev.slice(prev.length - 399) : prev.slice();
        next.push({ id, level, ts: nowTs(), text });
        return next;
      });
    }

    console.log = (...args) => {
      push("log", args);
      original.log(...args);
    };
    console.info = (...args) => {
      push("info", args);
      original.info(...args);
    };
    console.warn = (...args) => {
      push("warn", args);
      original.warn(...args);
    };
    console.error = (...args) => {
      push("error", args);
      original.error(...args);
    };
    console.debug = (...args) => {
      push("log", args);
      original.debug(...args);
    };

    function onError(ev) {
      // ev.error can be undefined
      const msg = ev?.error ? safeStringify(ev.error) : `${ev?.message || "Error"} @ ${ev?.filename || ""}:${ev?.lineno || ""}`;
      push("error", [msg]);
    }

    function onRejection(ev) {
      push("error", ["Unhandled promise rejection:", ev?.reason]);
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      console.log = original.log;
      console.info = original.info;
      console.warn = original.warn;
      console.error = original.error;
      console.debug = original.debug;

      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    if (!autoScroll) return;
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [entries, autoScroll]);

  const filtered = useMemo(() => {
    if (level === "all") return entries;
    return entries.filter((e) => e.level === level);
  }, [entries, level]);

  function clear() {
    setEntries([]);
  }

  return (
    <div className="card card-glass h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div>
            <h5 className="card-title mb-1">Console</h5>
            <div className="small text-muted">Client logs (captured from console.*)</div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 120 }}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="all">All</option>
              <option value="log">Log</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>

            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={clear}>
              Clear
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-2">
          <label className="small text-muted d-flex align-items-center gap-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <div className="small text-muted">{filtered.length} entries</div>
        </div>

        <div ref={boxRef} className="console-box">
        {filtered.length === 0 ? (
            <div className="small text-muted">No logs yet.</div>
        ) : (
            filtered.map((e) => (
            <div key={e.id} className={`console-line lvl-${e.level}`}>
                <span className="console-ts">{e.ts}</span>
                <span className="console-level">{e.level}</span>
                <span className="console-text">{e.text}</span>
            </div>
            ))
        )}
        </div>

      </div>
    </div>
  );
}
