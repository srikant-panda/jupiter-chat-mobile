import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as api from "../../api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../common/Loading";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = params.get("code");
    const provider = params.get("provider") || "google";

    if (!code) {
      setError("No authentication code received from provider.");
      return;
    }

    (async () => {
      try {
        await api.exchangeOAuthCode(code, provider);
        await refreshUser();
        const returnTo =
          localStorage.getItem("jupiter-chat.oauth.returnTo") || "/";
        localStorage.removeItem("jupiter-chat.oauth.returnTo");
        navigate(returnTo, { replace: true });
      } catch (err) {
        setError(err.message || "Failed to complete authentication.");
      }
    })();
  }, [params, navigate, refreshUser]);

  if (error) {
    return (
      <div className="mobile-loading-screen">
        <div className="mobile-auth-error" style={{ maxWidth: "320px" }}>
          <span>{error}</span>
        </div>
        <button
          type="button"
          className="mobile-action-btn cancel"
          style={{ marginTop: "16px" }}
          onClick={() => navigate("/", { replace: true })}
        >
          Return to Chat
        </button>
      </div>
    );
  }

  return <Loading message="Completing authentication…" />;
}
