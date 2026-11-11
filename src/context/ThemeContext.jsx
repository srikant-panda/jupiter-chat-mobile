import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  { id: "dark", name: "Dark", desc: "Pure OLED solid black" },
  { id: "midnight", name: "Midnight", desc: "Deep navy charcoal" },
  { id: "aurora", name: "Aurora", desc: "Cosmic deep space" },
  { id: "light", name: "Light", desc: "Crisp white interface" },
];

export const ACCENTS = [
  { id: "blue", name: "Blue", color: "#2563eb" },
  { id: "cyan", name: "Cyan", color: "#06b6d4" },
  { id: "violet", name: "Violet", color: "#8b5cf6" },
  { id: "amber", name: "Amber", color: "#f59e0b" },
  { id: "rose", name: "Rose", color: "#f43f5e" },
];

export const FONT_SIZES = [
  { id: 14, label: "Compact", px: 14 },
  { id: 16, label: "Default", px: 16 },
  { id: 18, label: "Large", px: 18 },
  { id: 20, label: "Extra Large", px: 20 },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("jupiter-chat.theme") || "dark"
  );
  const [accent, setAccent] = useState(
    () => localStorage.getItem("jupiter-chat.accent") || "blue"
  );
  const [fontSize, setFontSize] = useState(() => {
    const saved = Number(localStorage.getItem("jupiter-chat.fontSize"));
    return saved && [14, 16, 18, 20].includes(saved) ? saved : 16;
  });
  const [codeHighlighting, setCodeHighlighting] = useState(() => {
    const saved = localStorage.getItem("jupiter-chat.codeHighlighting");
    return saved !== null ? saved === "true" : true;
  });
  const [dictationEnabled, setDictationEnabled] = useState(() => {
    return localStorage.getItem("jupiter-chat.dictation") === "true";
  });
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    const saved = localStorage.getItem("jupiter-chat.haptics");
    return saved !== null ? saved === "true" : true;
  });
  const [streamAnimation, setStreamAnimation] = useState(() => {
    const saved = localStorage.getItem("jupiter-chat.streamAnim");
    return saved !== null ? saved === "true" : true;
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const resolved =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark"
          : theme;
      root.dataset.theme = resolved;

      // Update meta theme-color for mobile status bar
      const metaThemeColor = document.querySelector("meta[name='theme-color']");
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          resolved === "light" ? "#ffffff" : "#000000"
        );
      }
    };

    applyTheme();
    localStorage.setItem("jupiter-chat.theme", theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: light)");
      const handler = () => applyTheme();
      media.addEventListener?.("change", handler);
      return () => media.removeEventListener?.("change", handler);
    }
  }, [theme]);

  // Apply accent
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem("jupiter-chat.accent", accent);
  }, [accent]);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--chat-font-size",
      `${fontSize}px`
    );
    localStorage.setItem("jupiter-chat.fontSize", String(fontSize));
  }, [fontSize]);

  // Save other settings
  useEffect(() => {
    localStorage.setItem("jupiter-chat.codeHighlighting", String(codeHighlighting));
  }, [codeHighlighting]);

  useEffect(() => {
    localStorage.setItem("jupiter-chat.dictation", String(dictationEnabled));
  }, [dictationEnabled]);

  useEffect(() => {
    localStorage.setItem("jupiter-chat.haptics", String(hapticsEnabled));
  }, [hapticsEnabled]);

  useEffect(() => {
    localStorage.setItem("jupiter-chat.streamAnim", String(streamAnimation));
  }, [streamAnimation]);

  // Trigger mobile vibration if enabled and supported
  const triggerHaptic = (pattern = 10) => {
    if (hapticsEnabled && typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  return (
    <ThemeContext.Provider
      value={{
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
