import { useEffect, useRef, useState } from "react";
import { createShare, revokeShare, getMessages, shareUrl } from "../../api";

export default function ShareDialog({ chatId, onClose }) {
  const dialog = useRef(null);
  const [preview, setPreview] = useState(null);
  const [share, setShare] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    let active = true;
    getMessages(chatId)
      .then((data) => {
        if (active) setPreview(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
      dialog.current?.close();
    };
  }, [chatId]);
  const publish = async () => {
    setBusy(true);
    setError("");
    try {
      shareUrl("check");
      const data = await createShare(chatId);
      setShare(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const revoke = async () => {
    setBusy(true);
    setError("");
    try {
      await revokeShare(share.token);
      setShare(null);
      setCopied(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(share.token));
      setCopied(true);
    } catch {
      setError("Copy the link from the field below.");
    }
  };
  return (
    <dialog
      ref={dialog}
      className="experience-dialog"
      aria-labelledby="share-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="experience-dialog-body">
        <div className="experience-heading">
          <h2 id="share-title">Share conversation</h2>
          <button
            className="experience-button quiet"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            ✕
          </button>
        </div>
        <p>
          Anyone with the link can read this snapshot. Your profile, custom
          instructions and future messages are excluded. Readers can copy the
          content.
        </p>
        {share ? (
          <>
            <p className="experience-hint">
              Snapshot created {new Date(share.createdAt).toLocaleString()}. An
              existing link keeps its original snapshot. Revoke it before
              creating an updated snapshot.
            </p>
            <input
              aria-label="Share link"
              className="experience-link"
              readOnly
              value={shareUrl(share.token)}
              onFocus={(e) => e.target.select()}
            />
            <div className="experience-actions">
              <button className="experience-button" onClick={copy}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <button
                className="experience-button secondary"
                onClick={revoke}
                disabled={busy}
              >
                Revoke link
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="experience-hint">
              Review the saved messages before creating a public link.
            </p>
            <div className="share-preview">
              {preview === null
                ? "Loading preview…"
                : preview.map((m, i) => (
                    <div key={i}>
                      <strong>{m.role === "user" ? "You" : "Jupiter"}</strong>
                      <p>{m.content}</p>
                    </div>
                  ))}
            </div>
            <button
              className="experience-button"
              onClick={publish}
              disabled={busy || !preview?.some((m) => m.role === "assistant")}
            >
              {busy ? "Creating…" : "Create share link"}
            </button>
          </>
        )}
        {error && (
          <p role="alert" className="experience-error">
            {error}
          </p>
        )}
      </div>
    </dialog>
  );
}
