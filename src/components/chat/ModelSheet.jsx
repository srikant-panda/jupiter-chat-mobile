import React from "react";
import { Check, Zap, Sparkles, X } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";

export default function ModelSheet({ open, onClose }) {
  const { model, setModel, MODELS, MODEL_METADATA } = useChat();
  const { triggerHaptic } = useTheme();

  if (!open) return null;

  const handleSelect = (key) => {
    triggerHaptic(15);
    setModel(key);
    onClose();
  };

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose}>
      <div
        className="mobile-bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Model Selector"
      >
        {/* Grabber handle */}
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        {/* Sheet Header */}
        <div className="mobile-sheet-header">
          <div className="mobile-sheet-title-group">
            <h3 className="mobile-sheet-title">Select Model</h3>
            <span className="mobile-sheet-subtitle">
              Choose the AI engine for your conversation
            </span>
          </div>
          <button
            type="button"
            className="mobile-sheet-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Models list */}
        <div className="mobile-sheet-content">
          <div className="mobile-model-list">
            {MODELS.map((item) => {
              const meta = MODEL_METADATA[item] || {
                name: item
                  .split("/")
                  .pop()
                  .replace(/[-_]+/g, " ")
                  .toUpperCase(),
                desc: "Capable AI intelligence model",
                badge: "Model",
                speed: "Fast",
              };
              const isSelected = item === model;

              return (
                <button
                  key={item}
                  type="button"
                  className={`mobile-model-option ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="mobile-model-icon-box">
                    {meta.badge === "Pro" ? (
                      <Sparkles size={18} className="model-icon-accent" />
                    ) : (
                      <Zap size={18} className="model-icon-accent" />
                    )}
                  </div>

                  <div className="mobile-model-info">
                    <div className="mobile-model-row-title">
                      <span className="mobile-model-name">{meta.name}</span>
                      {meta.badge && (
                        <span className="mobile-model-badge">{meta.badge}</span>
                      )}
                    </div>
                    <span className="mobile-model-desc">{meta.desc}</span>
                  </div>

                  <div className="mobile-model-check-slot">
                    {isSelected && (
                      <div className="mobile-model-check-circle">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
