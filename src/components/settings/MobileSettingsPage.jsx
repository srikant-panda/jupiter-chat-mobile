import ProfileSettings from "./ProfileSettings";
import SharedLinks from "./SharedLinks";
import Avatar from "../common/Avatar";
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Check,
  Code2,
  Mic,
  Vibrate,
  Trash2,
  LogOut,
  AlertTriangle,
  Info,
  Shield,
  Palette,
  Sliders,
  Database,
  ExternalLink,
  Server,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useChat } from "../../context/ChatContext";
import { getApiBaseUrl, setCustomApiUrl } from "../../api";

export default function MobileSettingsPage({
  open,
  onClose,
  onRequestLogout,
  onRequestDeleteAccount,
  onRequestClearHistory,
}) {
  const { user } = useAuth();
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    fontSize,
    setFontSize,
    codeHighlighting,
    setCodeHighlighting,
    dictationEnabled,
    setDictationEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    streamAnimation,
    setStreamAnimation,
    triggerHaptic,
    THEMES,
    ACCENTS,
    FONT_SIZES,
  } = useTheme();
  const { chats } = useChat();

  // Sub-screen navigation: null = main settings, 'account' | 'about' | 'data'
  const [subScreen, setSubScreen] = useState(null);
  const [serverUrl, setServerUrl] = useState(() => getApiBaseUrl());
  const [editingServerUrl, setEditingServerUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(() => getApiBaseUrl());
  const [urlSaved, setUrlSaved] = useState(false);

  const handleSaveServerUrl = () => {
    triggerHaptic(15);
    setCustomApiUrl(tempUrl);
    setServerUrl(getApiBaseUrl());
    setEditingServerUrl(false);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  if (!open) return null;

  const usedTokens = user?.usage?.tokenUsed || 0;
  const tokenLimit = user?.usage?.tokenLimit || 100000;
  const usagePercent = Math.min(
    100,
    Math.round((usedTokens / tokenLimit) * 100)
  );

  const handleExportData = () => {
    triggerHaptic(20);
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(chats, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `jupiter-chat-history-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="mobile-full-settings-view"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Settings Top Bar */}
      <div className="mobile-settings-topbar">
        <button
          type="button"
          className="mobile-settings-back-btn"
          onClick={() => {
            triggerHaptic(10);
            if (subScreen) {
              setSubScreen(null);
            } else {
              onClose();
            }
          }}
          aria-label={subScreen ? "Back to Settings" : "Close Settings"}
        >
          <ChevronLeft size={24} />
          <span>{subScreen ? "Settings" : "Done"}</span>
        </button>

        <h1 className="mobile-settings-title">
          {subScreen === "account"
            ? "Account Details"
            : subScreen === "about"
            ? "About Jupiter"
            : "Settings"}
        </h1>

        <div className="mobile-settings-topbar-right" />
      </div>

      {/* Settings Scrollable Content */}
      <div className="mobile-settings-scroll-area">
        {subScreen === "account" ? (
          /* SUB-SCREEN: ACCOUNT DETAILS */
          <div className="mobile-settings-subview">
            {user && <div className="settings-enhanced-section"><ProfileSettings section="profile" /></div>}
            <div className="mobile-settings-card">
              <div className="mobile-settings-account-hero">
                <div className="mobile-settings-avatar-large">
                  <Avatar user={user} />
                </div>
                <h2 className="mobile-settings-user-name">
                  {user?.name || "User"}
                </h2>
                <span className="mobile-settings-user-email">
                  {user?.email}
                </span>
                <span className="mobile-plan-tag">
                  <Sparkles size={12} /> Free Tier Account
                </span>
              </div>
            </div>

            <div className="mobile-settings-section-title">
              Usage & Quota
            </div>
            <div className="mobile-settings-card">
              <div className="mobile-settings-usage-box">
                <div className="mobile-usage-header">
                  <span className="mobile-usage-label">Tokens used</span>
                  <span className="mobile-usage-value">
                    {usedTokens.toLocaleString()} /{" "}
                    {tokenLimit.toLocaleString()}
                  </span>
                </div>
                <div className="mobile-progress-track">
                  <div
                    className="mobile-progress-bar"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <span className="mobile-usage-caption">
                  {100 - usagePercent}% of this five-hour allowance remaining
                </span>
              </div>
            </div>

            <div className="mobile-settings-section-title">
              Account Security
            </div>
            <div className="mobile-settings-card no-padding">
              <button
                type="button"
                className="mobile-settings-row-btn text-danger"
                onClick={() => {
                  triggerHaptic(20);
                  onRequestLogout();
                }}
              >
                <LogOut size={18} />
                <span className="row-label">Log Out</span>
              </button>

              <div className="mobile-settings-card-divider" />

              <button
                type="button"
                className="mobile-settings-row-btn text-danger"
                onClick={() => {
                  triggerHaptic(30);
                  onRequestDeleteAccount();
                }}
              >
                <Trash2 size={18} />
                <span className="row-label">Delete Account</span>
              </button>
            </div>
          </div>
        ) : subScreen === "about" ? (
          /* SUB-SCREEN: ABOUT */
          <div className="mobile-settings-subview">
            <div className="mobile-settings-card text-center">
              <div className="mobile-about-brand">
                <span className="mobile-about-title">Jupiter AI</span>
                <span className="mobile-about-version">
                  Version 3.0.0 (Mobile Edition)
                </span>
              </div>
              <p className="mobile-about-desc">
                High performance AI chat mobile application designed for seamless
                conversations with advanced reasoning models.
              </p>
            </div>

            <div className="mobile-settings-section-title">Legal & Info</div>
            <div className="mobile-settings-card no-padding">
              <div className="mobile-settings-row-static">
                <span>Terms of Service</span>
                <span className="row-detail">Standard</span>
              </div>
              <div className="mobile-settings-card-divider" />
              <div className="mobile-settings-row-static">
                <span>Privacy Policy</span>
                <span className="row-detail">Protected</span>
              </div>
              <div className="mobile-settings-card-divider" />
              <div className="mobile-settings-row-static">
                <span>Developer</span>
                <span className="row-detail">Srikant Panda</span>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN SETTINGS VIEW (Matches ChatGPT Mobile) */
          <div className="mobile-settings-main">
            {/* Account Card */}
            {user ? (
              <div
                className="mobile-settings-account-card"
                onClick={() => {
                  triggerHaptic(10);
                  setSubScreen("account");
                }}
              >
                <div className="mobile-settings-avatar">
                  <Avatar user={user} />
                </div>
                <div className="mobile-settings-account-details">
                  <span className="account-card-name">
                    {user.name || "User"}
                  </span>
                  <span className="account-card-email">{user.email}</span>
                  <span className="account-card-badge">Free tier</span>
                </div>
                <ChevronRight size={18} className="account-card-arrow" />
              </div>
            ) : (
              <div className="mobile-settings-card">
                <div className="mobile-settings-guest-callout">
                  <User size={24} className="guest-icon" />
                  <div>
                    <span className="guest-title">Guest Workspace</span>
                    <p className="guest-sub">
                      Sign in to save and sync your conversations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user && <><details className="settings-enhanced-section"><summary>Personalization</summary><ProfileSettings section="personalization" /></details><details className="settings-enhanced-section"><summary>Privacy & shared links</summary><SharedLinks /><p className="experience-hint">Temporary chats disappear when you leave or reload. AI providers still receive your messages.</p></details></>}
            {/* SECTION: APPEARANCE */}
            <div className="mobile-settings-section-title">Appearance</div>
            <div className="mobile-settings-card">
              {/* Theme Picker */}
              <div className="mobile-settings-row">
                <div className="mobile-row-info">
                  <span className="row-label">Theme</span>
                  <span className="row-desc">Color palette interface</span>
                </div>
              </div>
              <div className="mobile-theme-pills-grid">
                {THEMES.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`mobile-theme-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        triggerHaptic(10);
                        setTheme(t.id);
                      }}
                    >
                      {t.id === "dark" && <Moon size={14} />}
                      {t.id === "midnight" && <Moon size={14} />}
                      {t.id === "aurora" && <Sparkles size={14} />}
                      {t.id === "light" && <Sun size={14} />}
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mobile-settings-card-divider" />

              {/* Accent Color Picker */}
              <div className="mobile-settings-row">
                <div className="mobile-row-info">
                  <span className="row-label">Accent Color</span>
                  <span className="row-desc">Active highlights and buttons</span>
                </div>
                <div className="mobile-swatch-list">
                  {ACCENTS.map((a) => {
                    const isSelected = accent === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className={`mobile-swatch-dot ${isSelected ? "selected" : ""}`}
                        style={{ backgroundColor: a.color }}
                        onClick={() => {
                          triggerHaptic(10);
                          setAccent(a.id);
                        }}
                        aria-label={`Select ${a.name} accent`}
                      >
                        {isSelected && (
                          <Check size={12} strokeWidth={3} color="#ffffff" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mobile-settings-card-divider" />

              {/* Font Size Selector */}
              <div className="mobile-settings-row">
                <div className="mobile-row-info">
                  <span className="row-label">Text Size</span>
                  <span className="row-desc">Message typography size</span>
                </div>
              </div>
              <div className="mobile-fontsize-segmented">
                {FONT_SIZES.map((fs) => {
                  const isSelected = fontSize === fs.px;
                  return (
                    <button
                      key={fs.id}
                      type="button"
                      className={`mobile-fontsize-segment ${isSelected ? "active" : ""}`}
                      onClick={() => {
                        triggerHaptic(10);
                        setFontSize(fs.px);
                      }}
                    >
                      {fs.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION: CHAT PREFERENCES */}
            <div className="mobile-settings-section-title">
              Chat & Input
            </div>
            <div className="mobile-settings-card no-padding">
              {/* Syntax Highlighting Toggle */}
              <div className="mobile-settings-toggle-row">
                <div className="toggle-row-info">
                  <span className="row-label">Syntax Highlighting</span>
                  <span className="row-desc">
                    Format code blocks with Prism colors
                  </span>
                </div>
                <button
                  type="button"
                  className={`mobile-switch ${codeHighlighting ? "on" : "off"}`}
                  onClick={() => {
                    triggerHaptic(10);
                    setCodeHighlighting((prev) => !prev);
                  }}
                  role="switch"
                  aria-checked={codeHighlighting}
                  aria-label="Toggle code syntax highlighting"
                >
                  <span className="mobile-switch-thumb" />
                </button>
              </div>

              <div className="mobile-settings-card-divider" />

              {/* Dictation Toggle */}
              <div className="mobile-settings-toggle-row">
                <div className="toggle-row-info">
                  <span className="row-label">Voice Dictation</span>
                  <span className="row-desc">
                    Speech-to-text in composer (Coming soon)
                  </span>
                </div>
                <button
                  type="button"
                  className={`mobile-switch ${dictationEnabled ? "on" : "off"}`}
                  onClick={() => {
                    triggerHaptic(10);
                    setDictationEnabled((prev) => !prev);
                  }}
                  role="switch"
                  aria-checked={dictationEnabled}
                  aria-label="Toggle dictation"
                >
                  <span className="mobile-switch-thumb" />
                </button>
              </div>

              <div className="mobile-settings-card-divider" />

              {/* Haptic Feedback Toggle */}
              <div className="mobile-settings-toggle-row">
                <div className="toggle-row-info">
                  <span className="row-label">Haptic Feedback</span>
                  <span className="row-desc">
                    Subtle vibration on touch interactions
                  </span>
                </div>
                <button
                  type="button"
                  className={`mobile-switch ${hapticsEnabled ? "on" : "off"}`}
                  onClick={() => {
                    triggerHaptic(20);
                    setHapticsEnabled((prev) => !prev);
                  }}
                  role="switch"
                  aria-checked={hapticsEnabled}
                  aria-label="Toggle haptics"
                >
                  <span className="mobile-switch-thumb" />
                </button>
              </div>
            </div>

            {/* SECTION: DATA CONTROLS */}
            <div className="mobile-settings-section-title">
              Data Controls
            </div>
            <div className="mobile-settings-card no-padding">
              <button
                type="button"
                className="mobile-settings-row-btn"
                onClick={handleExportData}
              >
                <Database size={17} />
                <span className="row-label">Export Chat History</span>
                <span className="row-detail">{chats.length} chats</span>
              </button>

              <div className="mobile-settings-card-divider" />

              <button
                type="button"
                className="mobile-settings-row-btn text-danger"
                onClick={() => {
                  triggerHaptic(20);
                  onRequestClearHistory();
                }}
              >
                <Trash2 size={17} />
                <span className="row-label">Clear All Conversations</span>
              </button>
            </div>

            {/* SECTION: BACKEND SERVER & NETWORK */}
            <div className="mobile-settings-section-title">
              Server Connection
            </div>
            <div className="mobile-settings-card">
              <div className="mobile-settings-row">
                <div className="mobile-row-info" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span className="row-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Server size={15} /> Backend API URL
                    </span>
                    {urlSaved && <span style={{ color: "#10b981", fontSize: "11px", fontWeight: 600 }}>Saved!</span>}
                  </div>
                  <span className="row-desc" style={{ marginTop: "3px", wordBreak: "break-all" }}>
                    {serverUrl}
                  </span>
                </div>
              </div>

              {editingServerUrl ? (
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="url"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://your-api.com/api or http://192.168.1.x:3000/api"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setEditingServerUrl(false)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--bg-surface-elevated)",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveServerUrl}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Save URL
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTempUrl(serverUrl);
                    setEditingServerUrl(true);
                  }}
                  style={{
                    alignSelf: "flex-start",
                    marginTop: "10px",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-xs)",
                    backgroundColor: "var(--bg-surface-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Change Server Address
                </button>
              )}
            </div>

            {/* SECTION: ABOUT & LOGOUT */}
            <div className="mobile-settings-section-title">About</div>
            <div className="mobile-settings-card no-padding">
              <button
                type="button"
                className="mobile-settings-row-btn"
                onClick={() => {
                  triggerHaptic(10);
                  setSubScreen("about");
                }}
              >
                <Info size={17} />
                <span className="row-label">About Jupiter AI</span>
                <ChevronRight size={16} className="row-arrow" />
              </button>

              {user && (
                <>
                  <div className="mobile-settings-card-divider" />
                  <button
                    type="button"
                    className="mobile-settings-row-btn text-danger"
                    onClick={() => {
                      triggerHaptic(20);
                      onRequestLogout();
                    }}
                  >
                    <LogOut size={17} />
                    <span className="row-label">Log Out</span>
                  </button>
                </>
              )}
            </div>

            <div className="mobile-settings-footer-text">
              Jupiter AI Mobile v3.0.0
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
