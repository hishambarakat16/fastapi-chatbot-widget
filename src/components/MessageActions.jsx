import React, { useState } from "react";

function IconThumbUp({ on = false }) {
  if (on) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 11v10H4V11h3Zm2 0 4.7-7.6c.5-.8 1.6-1 2.4-.5.8.5 1 1.6.5 2.4L14.6 11H20c1 0 1.9.8 1.9 1.8 0 .2 0 .3-.1.5l-2.2 7.1c-.2.8-1 1.3-1.8 1.3H9V11Z"
        />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 11v10H4V11h3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 11l5-8c.6-1 2-1 2.6 0 .3.5.4 1.1.2 1.6L13.5 11H20c1 0 1.9.8 1.9 1.8 0 .2 0 .3-.1.5l-2.2 7.1c-.2.8-1 1.3-1.8 1.3H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconThumbDown({ on = false }) {
  if (on) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 13V3H4v10h3Zm2 0h8.8c.8 0 1.6-.5 1.8-1.3l2.2-7.1c.1-.2.1-.3.1-.5C21.9 3.8 21 3 20 3h-5.4l1-5.1c.2-.8-.1-1.7-.9-2.1-.8-.5-1.9-.2-2.4.6L9 13Z"
        />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 13V3H4v10h3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 13l5 8c.6 1 2 1 2.6 0 .3-.5.4-1.1.2-1.6L13.5 13H20c1 0 1.9-.8 1.9-1.8 0-.2 0-.3-.1-.5L19.6 3.6C19.4 2.8 18.6 2.3 17.8 2.3H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCopy({ copied = false }) {
  return copied ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 9h10v12H9V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {}
  }

  return (
    <button
      className="cw-actionbtn"
      type="button"
      onClick={onCopy}
      title={copied ? "Copied" : "Copy"}
      aria-label="Copy message"
    >
      <IconCopy copied={copied} />
    </button>
  );
}

function IconRegenerate() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 1 0 3-6.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 4v5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function MessageActions({ text, canFeedback, chosen, onFeedback, messageId, onRegenerate }) {
  const locked = !canFeedback || !!chosen;

  return (
    <div className="cw-actions-out">
      <CopyBtn text={text} />

      <button
        className={`cw-actionbtn ${chosen === "thumbs_up" ? "is-on" : ""}`}
        disabled={locked}
        onClick={() => onFeedback?.({ feedback: "thumbs_up", messageId })}
        title={canFeedback ? "Thumbs up" : "Missing message id"}
        type="button"
        aria-label="Thumbs up"
      >
        <IconThumbUp on={chosen === "thumbs_up"} />
      </button>

      <button
        className={`cw-actionbtn ${chosen === "thumbs_down" ? "is-on" : ""}`}
        disabled={locked}
        onClick={() => onFeedback?.({ feedback: "thumbs_down", messageId })}
        title={canFeedback ? "Thumbs down" : "Missing message id"}
        type="button"
        aria-label="Thumbs down"
      >
        <IconThumbDown on={chosen === "thumbs_down"} />
      </button>
      <button
        className="cw-actionbtn"
        type="button"
        onClick={() => onRegenerate?.()}
        title="Regenerate response"
        aria-label="Regenerate response"
      >
        <IconRegenerate />
      </button>
    </div>
  );
}
