import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ArrowDown, AlertCircle } from "lucide-react";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";
import MobileMessageItem from "../chat/MobileMessageItem";
import MobileEmptyState from "../chat/MobileEmptyState";
import MobileComposer from "../chat/MobileComposer";
import MobileSettingsPage from "../settings/MobileSettingsPage";
import MobileAuthSheet from "../modals/MobileAuthSheet";
import {
  MobileDeleteModal,
  MobileLogoutModal,
  MobileClearHistoryModal,
  MobileCompleteProfileModal,
} from "../modals/MobileActionSheets";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function MobileLayout() {
  const {
    messages,
    loadingMessages,
    error,
    setError,
    isSending,
    deleteTarget,
    setDeleteTarget,
    handleDeleteChat,
    clearAllChats,
  } = useChat();
  const { logout, deleteAccount } = useAuth();
  const { triggerHaptic } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const touchStartRef = useRef(null);

  // Swipe gesture handling for drawer
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length !== 1 || settingsOpen) return;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1 || settingsOpen)
        return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      // Ensure horizontal swipe dominant
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0 && !drawerOpen) {
          // Swipe right to open drawer
          triggerHaptic(10);
          setDrawerOpen(true);
        } else if (dx < 0 && drawerOpen) {
          // Swipe left to close drawer
          triggerHaptic(10);
          setDrawerOpen(false);
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [drawerOpen, settingsOpen, triggerHaptic]);

  // Scroll detection
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNear = distanceToBottom <= 80;
    nearBottomRef.current = isNear;
    setShowScrollBottom(!isNear && messages.length > 2);
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    triggerHaptic(10);
    nearBottomRef.current = true;
    setShowScrollBottom(false);
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useLayoutEffect(() => {
    if (!nearBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleConfirmLogout = async () => {
    await logout();
    setLogoutOpen(false);
    setSettingsOpen(false);
  };

  const handleConfirmDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account and all history?"
      )
    ) {
      await deleteAccount();
      setSettingsOpen(false);
    }
  };

  const handleConfirmClearHistory = async () => {
    await clearAllChats();
    setClearHistoryOpen(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="mobile-app-shell">
      {/* Top App Header */}
      <MobileHeader onOpenDrawer={() => setDrawerOpen(true)} />

      {/* Error banner */}
      {error && (
        <div className="mobile-error-pill">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button
            type="button"
            className="mobile-error-dismiss"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Messages Scrollable Feed */}
      <main
        ref={scrollRef}
        className={`mobile-messages-feed ${
          !hasMessages ? "feed-empty" : "feed-active"
        }`}
        onScroll={handleScroll}
      >
        {loadingMessages && messages.length === 0 ? (
          <div className="mobile-feed-loading">
            <div className="mobile-skeleton-message asst" />
            <div className="mobile-skeleton-message user" />
            <div className="mobile-skeleton-message asst" />
          </div>
        ) : !hasMessages ? (
          <MobileEmptyState />
        ) : (
          <div className="mobile-messages-stream">
            {messages.map((msg) => (
              <MobileMessageItem
                key={msg.reactKey || msg._id || Math.random()}
                message={msg}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Scroll-to-Bottom / Generating Indicator */}
      {isSending && showScrollBottom ? (
        <button
          type="button"
          className="mobile-floating-executing-btn"
          onClick={scrollToBottom}
          aria-label="Jupiter is thinking - Tap to scroll to bottom"
        >
          <span className="mobile-pulse-ring" />
          <span className="mobile-executing-label">Generating…</span>
          <ArrowDown size={14} />
        </button>
      ) : showScrollBottom ? (
        <button
          type="button"
          className="mobile-floating-scroll-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to newest message"
        >
          <ArrowDown size={18} />
        </button>
      ) : null}

      {/* Pinned Bottom Mobile Composer */}
      <MobileComposer />

      {/* Slide Navigation Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Full-Screen ChatGPT-Style Settings Page */}
      <MobileSettingsPage
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onRequestLogout={() => setLogoutOpen(true)}
        onRequestDeleteAccount={handleConfirmDeleteAccount}
        onRequestClearHistory={() => setClearHistoryOpen(true)}
      />

      {/* Modals & Action Sheets */}
      <MobileAuthSheet />
      <MobileCompleteProfileModal />
      <MobileDeleteModal
        chat={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => {
          handleDeleteChat(id);
          setDeleteTarget(null);
        }}
      />
      <MobileLogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
      <MobileClearHistoryModal
        open={clearHistoryOpen}
        onClose={() => setClearHistoryOpen(false)}
        onConfirm={handleConfirmClearHistory}
      />
    </div>
  );
}
