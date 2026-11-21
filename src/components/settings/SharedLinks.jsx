import { useEffect, useState } from "react";
import { listShares, revokeShare, shareUrl } from "../../api";
export default function SharedLinks() {
  const [shares, setShares] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    let active = true;
    listShares()
      .then((data) => {
        if (active) setShares(data.shares);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const revoke = async (token) => {
    setBusy(token);
    setError("");
    try {
      await revokeShare(token);
      setShares((items) => items.filter((s) => s.token !== token));
      setStatus("Share link revoked.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };
  const copy = async (token) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token));
      setStatus("Link copied.");
    } catch (err) {
      setError(err.message || "Could not copy link.");
    }
  };
  return (
    <section className="shared-links">
      <h3>Shared conversations</h3>
      <p className="experience-hint">
        Links are public to anyone who has them. Revoking a link stops future
        access; it cannot remove copies readers already made.
      </p>
      {shares === null && !error && <p role="status">Loading links…</p>}
      {shares?.length === 0 && <p>No shared conversations yet.</p>}
      {shares?.map((share) => (
        <div className="shared-link-row" key={share.token}>
          <div>
            <strong>{share.title}</strong>
            <small>{new Date(share.createdAt).toLocaleDateString()}</small>
          </div>
          <button
            className="experience-button secondary"
            onClick={() => copy(share.token)}
          >
            Copy
          </button>
          <button
            className="experience-button secondary"
            disabled={!!busy}
            onClick={() => revoke(share.token)}
          >
            {busy === share.token ? "Revoking…" : "Revoke"}
          </button>
        </div>
      ))}
      {error && (
        <p className="experience-error" role="alert">
          {error}
        </p>
      )}
      {status && <p role="status">{status}</p>}
    </section>
  );
}
