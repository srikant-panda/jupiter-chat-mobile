import React, { useState } from "react";
import { Trash2, LogOut, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Delete Single Chat Modal
export function MobileDeleteModal({ chat, onClose, onConfirm }) {
  const { triggerHaptic } = useTheme();
  if (!chat) return null;

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose}>
      <div
        className="mobile-action-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        <div className="mobile-action-sheet-icon danger">
          <Trash2 size={24} />
        </div>

        <h3 className="mobile-action-sheet-title">Delete Conversation?</h3>
        <p className="mobile-action-sheet-desc">
          "{chat.topic || "This conversation"}" will be permanently removed from your history. This action cannot be undone.
        </p>

        <div className="mobile-action-sheet-buttons">
          <button
            type="button"
            className="mobile-action-btn danger"
            onClick={() => {
              triggerHaptic(30);
              onConfirm(chat._id);
            }}
          >
            Delete
          </button>
          <button
            type="button"
            className="mobile-action-btn cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Log Out Modal
export function MobileLogoutModal({ open, onClose, onConfirm }) {
  const { triggerHaptic } = useTheme();
  if (!open) return null;

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose}>
      <div
        className="mobile-action-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        <div className="mobile-action-sheet-icon">
          <LogOut size={24} />
        </div>

        <h3 className="mobile-action-sheet-title">Log out of Jupiter?</h3>
        <p className="mobile-action-sheet-desc">
          You can sign back in at any time to access your conversations and synced preferences.
        </p>

        <div className="mobile-action-sheet-buttons">
          <button
            type="button"
            className="mobile-action-btn danger"
            onClick={() => {
              triggerHaptic(20);
              onConfirm();
            }}
          >
            Log Out
          </button>
          <button
            type="button"
            className="mobile-action-btn cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Clear All History Modal
export function MobileClearHistoryModal({ open, onClose, onConfirm }) {
  const { triggerHaptic } = useTheme();
  if (!open) return null;

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose}>
      <div
        className="mobile-action-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        <div className="mobile-action-sheet-icon danger">
          <AlertTriangle size={24} />
        </div>

        <h3 className="mobile-action-sheet-title">Clear All Conversations?</h3>
        <p className="mobile-action-sheet-desc">
          All your chats and messages will be permanently deleted. This action cannot be reversed.
        </p>

        <div className="mobile-action-sheet-buttons">
          <button
            type="button"
            className="mobile-action-btn danger"
            onClick={() => {
              triggerHaptic(30);
              onConfirm();
            }}
          >
            Clear All History
          </button>
          <button
            type="button"
            className="mobile-action-btn cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Complete Profile (Age Verification) Modal
export function MobileCompleteProfileModal() {
  const { needsAge, completeAgeVerification } = useAuth();
  const { triggerHaptic } = useTheme();
  const [age, setAge] = useState("18");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!needsAge) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 1 || numAge > 120) {
      setError("Please provide a valid age between 1 and 120.");
      return;
    }

    triggerHaptic(15);
    setLoading(true);
    setError("");
    try {
      await completeAgeVerification(numAge);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-sheet-backdrop">
      <div
        className="mobile-action-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        <h3 className="mobile-action-sheet-title">Age Verification Required</h3>
        <p className="mobile-action-sheet-desc">
          Please confirm your age to finish setting up your account.
        </p>

        {error && (
          <div className="mobile-auth-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div className="mobile-input-field" style={{ margin: "14px 0" }}>
            <span className="input-icon-text">Age</span>
            <input
              type="number"
              placeholder="Your Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="mobile-auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Saving…" : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
