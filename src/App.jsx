import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import MobileLayout from "./components/layout/MobileLayout";
import OAuthCallback from "./components/auth/OAuthCallback";
import Loading from "./components/common/Loading";

function MobileChatRoute() {
  const { loading } = useAuth();
  if (loading) {
    return <Loading />;
  }
  return <MobileLayout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<MobileChatRoute />} />
              <Route path="/chat" element={<MobileChatRoute />} />
              <Route path="/chat/:chatId" element={<MobileChatRoute />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/:chatId" element={<MobileChatRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
