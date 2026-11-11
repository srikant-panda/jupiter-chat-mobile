import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  X,
  MessageSquare,
  Trash2,
  Settings,
  LogIn,
  Sparkles,
} from "lucide-react";
import BrandGlyph from "../common/BrandGlyph";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function MobileDrawer({ open, onClose, onOpenSettings }) {
  const navigate = useNavigate();
  const { user, requestAuth } = useAuth();
  const {
    chats,
    activeChatId,
    newChat,
    searchQuery,
    setSearchQuery,
    setDeleteTarget,
    loadingChats,
  } = useChat();
  const { triggerHaptic } = useTheme();

  const handleSelectChat = (id) => {
    triggerHaptic(10);
    navigate(`/chat/${id}`);
    onClose();
  };

  const handleNewChat = () => {
    triggerHaptic(15);
    newChat();
    onClose();
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((c) => (c.topic || "Conversation").toLowerCase().includes(q));
  }, [chats, searchQuery]);

  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 86400000 * 7;
    const groups = { Today: [], Yesterday: [], "Previous 7 Days": [], Older: [] };

    filteredChats.forEach((chat) => {
      const chatDate = new Date(
        chat.updatedAt || chat.createdAt || 0
      ).getTime();
      if (chatDate >= today) groups.Today.push(chat);
      else if (chatDate >= yesterday) groups.Yesterday.push(chat);
      else if (chatDate >= sevenDaysAgo) groups["Previous 7 Days"].push(chat);
      else groups.Older.push(chat);
    });
    return groups;
  }, [filteredChats]);

  if (!open) return null;

  return (
    <div className="mobile-drawer-backdrop" onClick={onClose}>
      <aside
        className="mobile-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label="Navigation drawer"
      >
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <BrandGlyph size={26} />
            <span className="mobile-drawer-brand-name">Jupiter AI</span>
            <span className="mobile-drawer-brand-badge">v3.0</span>
          </div>
          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="mobile-drawer-actions">
          <button
            type="button"
            className="mobile-drawer-newchat-btn"
            onClick={handleNewChat}
          >
            <Plus size={18} />
            <span>New conversation</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="mobile-drawer-search">
          <Search size={15} className="mobile-drawer-search-icon" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-drawer-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="mobile-drawer-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Conversation History List */}
        <div className="mobile-drawer-history">
          {!user ? (
            <div className="mobile-drawer-guest-banner">
              <MessageSquare size={28} className="guest-icon" />
              <span className="guest-title">Guest Workspace</span>
              <p className="guest-desc">
                Sign in to save your conversations across devices.
              </p>
              <button
                type="button"
                className="mobile-guest-signin-btn"
                onClick={() => {
                  onClose();
                  requestAuth("login");
                }}
              >
                <LogIn size={15} />
                <span>Sign In or Sign Up</span>
              </button>
            </div>
          ) : loadingChats ? (
            <div className="mobile-drawer-skeleton">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="mobile-drawer-skeleton-row" />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="mobile-drawer-empty">
              <span>{searchQuery ? "No matches found" : "No conversations yet"}</span>
            </div>
          ) : (
            Object.entries(groupedChats).map(([groupTitle, groupItems]) =>
              groupItems.length > 0 ? (
                <div key={groupTitle} className="mobile-history-group">
                  <div className="mobile-history-group-title">{groupTitle}</div>
                  <div className="mobile-history-items">
                    {groupItems.map((chat) => {
                      const isActive = String(chat._id) === String(activeChatId);
                      return (
                        <div
                          key={chat._id}
                          className={`mobile-history-row ${isActive ? "active" : ""}`}
                          onClick={() => handleSelectChat(chat._id)}
                        >
                          <span className="mobile-history-title">
                            {chat.topic || "New Conversation"}
                          </span>
                          <button
                            type="button"
                            className="mobile-history-del-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic(20);
                              setDeleteTarget(chat);
                            }}
                            aria-label="Delete conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null
            )
          )}
        </div>

        {/* Drawer Footer — User Account / Settings launcher */}
        <div className="mobile-drawer-footer">
          {user ? (
            <button
              type="button"
              className="mobile-user-profile-card"
              onClick={() => {
                triggerHaptic(15);
                onClose();
                onOpenSettings();
              }}
            >
              <div className="mobile-user-avatar">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="mobile-user-info">
                <span className="mobile-user-name">{user.name || "User"}</span>
                <span className="mobile-user-sub">
                  <Sparkles size={11} className="tier-star" /> Free tier
                </span>
              </div>
              <div className="mobile-user-settings-icon">
                <Settings size={18} />
              </div>
            </button>
          ) : (
            <button
              type="button"
              className="mobile-user-profile-card"
              onClick={() => {
                onClose();
                requestAuth("login");
              }}
            >
              <div className="mobile-user-avatar guest">
                <LogIn size={16} />
              </div>
              <div className="mobile-user-info">
                <span className="mobile-user-name">Sign In</span>
                <span className="mobile-user-sub">Save conversations</span>
              </div>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
