import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import { GoogleIcon } from "../common/BrandGlyph";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function MobileAuthSheet() {
  const {
    authSheetOpen,
    authSheetMode,
    setAuthSheetMode,
    closeAuthModal,
    login,
    signup,
    startGoogleLogin,
  } = useAuth();
  const { triggerHaptic } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("18");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authSheetOpen) return null;

  const isLogin = authSheetMode === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!isLogin) {
      if (!name.trim() || name.trim().length < 2) {
        setError("Name must be at least 2 characters long.");
        return;
      }
      const numAge = parseInt(age, 10);
      if (isNaN(numAge) || numAge < 1 || numAge > 120) {
        setError("Please enter a valid age between 1 and 120.");
        return;
      }
    }

    triggerHaptic(15);
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await signup(name.trim(), email.trim(), password, parseInt(age, 10));
      }
    } catch (err) {
      setError(
        err.payload?.errors?.map((x) => x.message).join(" ") ||
          err.payload?.message ||
          err.message ||
          "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-sheet-backdrop" onClick={closeAuthModal}>
      <div
        className="mobile-auth-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Account Authentication"
      >
        {/* Grabber handle */}
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        {/* Header */}
        <div className="mobile-auth-header">
          <h2 className="mobile-auth-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <button
            type="button"
            className="mobile-sheet-close-btn"
            onClick={closeAuthModal}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="mobile-auth-tabs">
          <button
            type="button"
            className={`mobile-auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              triggerHaptic(10);
              setError("");
              setAuthSheetMode("login");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`mobile-auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              triggerHaptic(10);
              setError("");
              setAuthSheetMode("signup");
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mobile-auth-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mobile-auth-form">
          {!isLogin && (
            <>
              <div className="mobile-input-field">
                <UserIcon size={17} className="input-icon" />
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoCapitalize="words"
                />
              </div>

              <div className="mobile-input-field">
                <span className="input-icon-text">Age</span>
                <input
                  type="number"
                  placeholder="Your Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  required
                />
              </div>
            </>
          )}

          <div className="mobile-input-field">
            <Mail size={17} className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoCapitalize="none"
              autoComplete="email"
            />
          </div>

          <div className="mobile-input-field">
            <Lock size={17} className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            className="mobile-auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="mobile-mini-spinner" />
            ) : isLogin ? (
              "Sign In to Jupiter"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mobile-auth-divider">
          <span>OR</span>
        </div>

        {/* Google OAuth Login */}
        <button
          type="button"
          className="mobile-google-btn"
          onClick={() => {
            triggerHaptic(15);
            startGoogleLogin();
          }}
        >
          <GoogleIcon size={18} />
          <span>Continue with Google</span>
        </button>

        <div className="mobile-auth-footer-terms">
          By continuing, you agree to Jupiter AI's Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
