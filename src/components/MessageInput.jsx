import React from "react";

export default function MessageInput({ value, onChange, onSend, disabled }) {
  function onKeyDown(e) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="input-pill d-flex align-items-center gap-2">
      <textarea
        className="form-control chat-textarea"
        placeholder={disabled ? "Start a session first..." : "Type a message"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        disabled={disabled}
      />
      <button
        className="btn btn-primary send-btn"
        onClick={onSend}
        disabled={disabled || !value.trim()}
      >
        Send
      </button>
    </div>
  );
}
