import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsAge, setNeedsAge] = useState(false);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [authSheetMode, setAuthSheetMode] = useState("login"); // 'login' | 'signup'

  const refreshUser = useCallback(async () => {
    try {
      if (!api.getAccessToken() && !(await api.refreshAccessToken())) {
        setUser(null);
        return;
      }
      const me = await api.getMe();
      setUser(me.data);
    } catch (err) {
      if (api.isAgeRequiredError(err)) {
        setNeedsAge(true);
      } else {
        api.setAccessToken("");
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const requestAuth = (mode = "login") => {
    setAuthSheetMode(mode);
    setAuthSheetOpen(true);
  };

  const closeAuthModal = () => {
    setAuthSheetOpen(false);
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    const me = await api.getMe();
    setUser(me.data);
    closeAuthModal();
    return data;
  };

  const signup = async (name, email, password, age) => {
    const data = await api.signup(name, email, password, age);
    const me = await api.getMe();
    setUser(me.data);
    closeAuthModal();
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteUserAccount();
    } finally {
      api.setAccessToken("");
      setUser(null);
    }
  };

  const completeAgeVerification = async (age) => {
    await api.completeAuth(age);
    setNeedsAge(false);
    await refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        needsAge,
        setNeedsAge,
        authSheetOpen,
        authSheetMode,
        setAuthSheetMode,
        requestAuth,
        closeAuthModal,
        login,
        signup,
        logout,
        deleteAccount,
        refreshUser,
        completeAgeVerification,
        startGoogleLogin: api.startGoogleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
