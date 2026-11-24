import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Pencil, Sparkles } from "lucide-react";
import BrandGlyph from "../common/BrandGlyph";
import MobileCodeBlock from "./MobileCodeBlock";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";

export default function MobileMessageItem({ message }) {
  const { isSending, send } = useChat();
  const { triggerHaptic } = useTheme();
  const isUser = message.role === "user";

  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content || "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      triggerHaptic(15);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editDraft.trim() || isSending) return;
    setEditing(false);
    send(editDraft.trim());
  };

  const timeString = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (isUser) {
    return (
      <div className="mobile-message-row user-row">
        <div className="mobile-user-bubble-container">
          {editing ? (
            <form onSubmit={handleSaveEdit} className="mobile-message-edit-form">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                rows={3}
                className="mobile-edit-textarea"
                autoFocus
              />
              <div className="mobile-edit-actions">
                <button
                  type="button"
                  className="mobile-edit-cancel-btn"
                  onClick={() => {
                    setEditing(false);
                    setEditDraft(message.content || "");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mobile-edit-submit-btn"
                  disabled={!editDraft.trim() || isSending}
                >
                  Send
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mobile-user-bubble">
                <span className="mobile-user-text">{message.content}</span>
              </div>
              <div className="mobile-user-actions">
                <button
                  type="button"
                  className="mobile-msg-action-btn"
                  onClick={() => setEditing(true)}
                  aria-label="Edit message"
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="mobile-msg-action-btn"
                  onClick={handleCopy}
                  aria-label="Copy message"
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="mobile-message-row assistant-row">
      <div className="mobile-assistant-container">
        <div className="mobile-assistant-header">
          <div className="mobile-assistant-avatar">
            <BrandGlyph size={18} />
          </div>
          <span className="mobile-assistant-name">Jupiter</span>
          {timeString && <span className="mobile-msg-time">{timeString}</span>}
        </div>

        <div className="mobile-assistant-body">
          {!message.content && message.streaming ? (
            <div className="mobile-streaming-skeleton">
              <span className="mobile-typing-dot" />
              <span className="mobile-typing-dot" />
              <span className="mobile-typing-dot" />
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  if (!inline && (match || codeString.includes("\n"))) {
                    return (
                      <MobileCodeBlock
                        code={codeString}
                        language={match ? match[1] : "text"}
                      />
                    );
                  }
                  return (
                    <code className="mobile-inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="mobile-table-wrapper">
                      <table className="mobile-md-table">{children}</table>
                    </div>
                  );
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-md-link"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {message.streaming && (
            <span className="mobile-cursor-blink" aria-hidden="true" />
          )}
        </div>

        {/* Action Bar */}
        {message.content && !message.streaming && (
          <div className="mobile-assistant-actions">
            <button
              type="button"
              className="mobile-msg-action-btn"
              onClick={handleCopy}
              aria-label="Copy assistant answer"
            >
              {copied ? (
                <>
                  <Check size={13} color="#10b981" />
                  <span style={{ color: "#10b981" }}>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {message?.usage?.totalTokens && (
              <span className="mobile-token-pill">
                <Sparkles size={11} />
                <span>{message.usage.totalTokens} tokens</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
