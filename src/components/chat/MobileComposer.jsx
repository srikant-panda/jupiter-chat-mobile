import React, { useRef, useEffect, useState } from "react";
import { Plus, ArrowUp, Square, Mic, X, Globe } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";

export default function MobileComposer() {
  const { draft, setDraft, send, stopStreaming, isSending, webSearch, toggleWebSearch } = useChat();
  const { triggerHaptic } = useTheme();
  const textareaRef = useRef(null);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (draft) {
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          130
        )}px`;
      }
    }
  }, [draft]);

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(""), 2200);
  };

  const handleInput = (e) => {
    setDraft(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // On mobile keyboards, Enter is often preferred for sending unless multiline
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = (draft || "").trim();
    if (!text || isSending) return;
    triggerHaptic(20);
    setDraft("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    send(text);
  };

  const handleStop = () => {
    triggerHaptic(30);
    stopStreaming();
  };

  const hasDraft = Boolean(draft && draft.trim());

  return (
    <div className="mobile-composer-wrapper">
      {/* Mini Toast */}
      {toastMessage && (
        <div className="mobile-composer-toast" role="status">
          <span>{toastMessage}</span>
          <button
            type="button"
            className="mobile-toast-close"
            onClick={() => setToastMessage("")}
            aria-label="Dismiss notification"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div
        className={`mobile-composer-capsule ${
          draft && (draft.length > 50 || draft.includes("\n")) ? "is-multiline" : ""
        }`}
      >
        {/* Left Plus action */}
        <button
          type="button"
          className="mobile-composer-btn mobile-plus-btn"
          onClick={() => {
            triggerHaptic(10);
            showToast("Attachments coming soon");
          }}
          aria-label="Add attachment"
        >
          <Plus size={20} />
        </button>

        {/* Center input */}
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={isSending ? "Jupiter is thinking…" : "Ask anything…"}
          rows={1}
          className="mobile-composer-input"
          enterKeyHint="send"
        />

        {/* Right action group */}
        <div className="mobile-composer-right-actions">
          {/* Web Search toggle */}
          <button
            type="button"
            className={`mobile-composer-btn mobile-search-btn ${webSearch ? "active" : ""}`}
            onClick={() => {
              triggerHaptic(15);
              toggleWebSearch();
            }}
            aria-label="Toggle web search"
            aria-pressed={webSearch}
            title={webSearch ? "Web search ON" : "Search web"}
          >
            <Globe size={18} />
          </button>

          {!hasDraft && !isSending && (
            <button
              type="button"
              className="mobile-composer-btn mobile-mic-btn"
              onClick={() => {
                triggerHaptic(10);
                showToast("Voice mode coming soon");
              }}
              aria-label="Voice input"
            >
              <Mic size={18} />
            </button>
          )}

          {isSending ? (
            <button
              type="button"
              className="mobile-composer-send-btn is-stop"
              onClick={handleStop}
              aria-label="Stop generating response"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              className={`mobile-composer-send-btn ${hasDraft ? "is-ready" : "is-idle"}`}
              disabled={!hasDraft}
              onClick={handleSend}
              aria-label="Send message"
            >
              <ArrowUp size={18} strokeWidth={2.8} />
            </button>
          )}
        </div>
      </div>

      <div className="mobile-composer-disclaimer">
        Jupiter AI may display inaccurate info.
      </div>
    </div>
  );
}
