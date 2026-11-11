import React, { useState } from "react";
import { Menu, SquarePen, ChevronDown } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
import ModelSheet from "../chat/ModelSheet";

export default function MobileHeader({ onOpenDrawer }) {
  const { model, activeChat, newChat, MODEL_METADATA } = useChat();
  const { triggerHaptic } = useTheme();
  const [modelSheetOpen, setModelSheetOpen] = useState(false);

  const modelName =
    MODEL_METADATA[model]?.name ||
    model
      .split("/")
      .pop()
      .replace(/:free$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const handleOpenModelSheet = () => {
    triggerHaptic(10);
    setModelSheetOpen(true);
  };

  const handleNewChat = () => {
    triggerHaptic(15);
    newChat();
  };

  return (
    <>
      <header className="mobile-header">
        {/* Left: Menu button */}
        <div className="mobile-header-left">
          <button
            type="button"
            className="mobile-header-icon-btn"
            onClick={() => {
              triggerHaptic(10);
              onOpenDrawer();
            }}
            aria-label="Open conversation menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Center: Model Selector Pill or Active Topic */}
        <div className="mobile-header-center">
          <button
            type="button"
            className="mobile-model-pill"
            onClick={handleOpenModelSheet}
            aria-label="Select AI Model"
          >
            <span className="mobile-model-indicator-dot" />
            <span className="mobile-model-pill-text">
              {activeChat ? activeChat.topic || "Conversation" : modelName}
            </span>
            <ChevronDown size={14} className="mobile-model-pill-arrow" />
          </button>
        </div>

        {/* Right: New Chat button */}
        <div className="mobile-header-right">
          <button
            type="button"
            className="mobile-header-icon-btn"
            onClick={handleNewChat}
            aria-label="Start new chat"
          >
            <SquarePen size={21} />
          </button>
        </div>
      </header>

      {/* Model Selection Bottom Sheet */}
      <ModelSheet
        open={modelSheetOpen}
        onClose={() => setModelSheetOpen(false)}
      />
    </>
  );
}
