import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useLocation, useMatch } from "react-router-dom";
import * as api from "../api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const DEFAULT_MODEL =
  import.meta.env.VITE_DEFAULT_MODEL || "free";
export const MODELS = (import.meta.env.VITE_MODELS || DEFAULT_MODEL)
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

export const MODEL_METADATA = {
  free: {
    name: "Jupiter Auto",
    provider: "Auto (Multi-Provider)",
    desc: "Dynamic multi-provider failover (Groq → OpenRouter → Gemini)",
    badge: "Auto",
    speed: "Ultra Fast",
  },
  "openrouter/free": {
    name: "Jupiter Free",
    provider: "OpenRouter",
    desc: "Fast, intelligent, everyday reasoning",
    badge: "Free",
    speed: "Fast",
  },
  "google/gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    provider: "Google",
    desc: "State of the art multimodal & speed",
    badge: "Fast",
    speed: "Instant",
  },
  "openai/gpt-4o-mini": {
    name: "GPT-4o Mini",
    provider: "OpenAI",
    desc: "Lightweight, smart & capable model",
    badge: "Smart",
    speed: "Very Fast",
  },
  "anthropic/claude-3-haiku": {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    desc: "Quick, concise, and nuanced writing",
    badge: "Quick",
    speed: "Fast",
  },
};

export function ChatProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const matchDirect = useMatch("/:chatId");
  const matchChat = useMatch("/chat/:chatId");
  const rawChatId = matchDirect?.params?.chatId || matchChat?.params?.chatId;
  const chatId =
    rawChatId &&
    !["temporary", "share", "auth", "chat", "login", "register", "landing", "settings"].includes(
      rawChatId
    )
      ? rawChatId
      : undefined;

  const { user, requestAuth } = useAuth();
  const isAuthenticated = Boolean(user);
  const userRef = useRef(user);
  userRef.current = user;

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(Boolean(user));
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [model, setModel] = useState(
    () => localStorage.getItem("jupiter-chat.model") || DEFAULT_MODEL
  );
  const [webSearch, setWebSearch] = useState(
    () => localStorage.getItem("jupiter-chat.webSearch") === "true"
  );

  const toggleWebSearch = useCallback(() => {
    setWebSearch((prev) => {
      const next = !prev;
      localStorage.setItem("jupiter-chat.webSearch", String(next));
      return next;
    });
  }, []);
  const [modelMetadata, setModelMetadata] = useState(MODEL_METADATA);
  const [activeModels, setActiveModels] = useState(MODELS);

  const loadModels = useCallback(async () => {
    try {
      const res = await api.getModels();
      if (res?.success && Array.isArray(res.models) && res.models.length > 0) {
        const ids = res.models.map((m) => m.modelId);
        setActiveModels(ids);
        const meta = { ...MODEL_METADATA };
        res.models.forEach((m) => {
          meta[m.modelId] = {
            name: m.name,
            provider: m.provider,
            desc: m.desc || "",
            badge: m.badge || "Pro",
            speed: m.speed || "Balanced",
          };
        });
        setModelMetadata(meta);
        setModel((current) => {
          if (ids.includes(current)) return current;
          return res.defaultModel || ids[0] || DEFAULT_MODEL;
        });
      }
    } catch (err) {
      console.warn("[MobileChatContext] Could not load models:", err.message);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const [drafts, setDrafts] = useState({});
  const [newChatNonce, setNewChatNonce] = useState(0);
  const streamsRef = useRef(new Map());
  const viewRef = useRef(chatId);
  const [streamingChatIds, setStreamingChatIds] = useState(new Set());

  viewRef.current = chatId;
  const currentKey = chatId ? String(chatId) : `new:${newChatNonce}`;
  const draft = drafts[currentKey] || "";

  const setDraft = useCallback(
    (text) => {
      setDrafts((prev) => ({ ...prev, [currentKey]: text }));
    },
    [currentKey]
  );

  useEffect(() => {
    localStorage.setItem("jupiter-chat.model", model);
  }, [model]);

  // Load chat list when user is authenticated
  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
    setLoadingChats(true);
    try {
      const list = await api.getRecentChats();
      setChats(list);
    } catch (err) {
      console.warn("Failed to load chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    let cancelled = false;
    setLoadingMessages(true);
    setError("");

    api
      .getMessages(chatId)
      .then((data) => {
        if (!cancelled) {
          setMessages(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load messages.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const activeChat = useMemo(() => {
    if (!chatId) return streamingChatIds.has("new") ? chats[0] || null : null;
    return chats.find((c) => String(c._id) === String(chatId)) || null;
  }, [chats, chatId, streamingChatIds]);

  const isSending = useMemo(() => {
    const key = chatId ? String(chatId) : "new";
    return streamingChatIds.has(key);
  }, [chatId, streamingChatIds]);

  const newChat = useCallback(() => {
    setNewChatNonce((n) => n + 1);
    navigate("/");
  }, [navigate]);

  const stopStreaming = useCallback(() => {
    const key = chatId ? String(chatId) : "new";
    const controller = streamsRef.current.get(key);
    if (controller) {
      controller.abort();
      streamsRef.current.delete(key);
    }
    setStreamingChatIds((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [chatId]);

  const send = useCallback(
    async (text) => {
      const prompt = (text || "").trim();
      if (!prompt) return;
      if (!userRef.current) { requestAuth("login"); return; }
      if (streamsRef.current.has(chatId ? String(chatId) : "new")) return;

      const streamKey = chatId ? String(chatId) : "new";
      const abortController = new AbortController();
      streamsRef.current.set(streamKey, abortController);

      setStreamingChatIds((prev) => new Set(prev).add(streamKey));
      setError("");

      const userMsgId = `temp-user-${Date.now()}`;
      const assistantMsgId = `temp-asst-${Date.now()}`;

      const userMessage = {
        _id: userMsgId,
        reactKey: userMsgId,
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
      };

      const placeholderAssistant = {
        _id: assistantMsgId,
        reactKey: assistantMsgId,
        role: "assistant",
        content: "",
        streaming: true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, placeholderAssistant]);

      let accumulatedContent = "";
      let accumulatedReasoning = "";
      let newServerChatId = null;

      try {
        await api.streamMessage({
          content: prompt,
          chatId,
          model,
          webSearch,
          signal: abortController.signal,
          onEvent: (event, payload) => {
            if (event === "reasoning") {
              const piece =
                typeof payload === "string"
                  ? payload
                  : payload?.text || payload?.reasoning || "";
              accumulatedReasoning += piece;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._id === assistantMsgId
                    ? { ...msg, reasoning: accumulatedReasoning, streaming: true }
                    : msg
                )
              );
            } else if (event === "token" || event === "chunk" || event === "content") {
              const piece =
                typeof payload === "string"
                  ? payload
                  : payload?.text || payload?.content || "";
              accumulatedContent += piece;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._id === assistantMsgId
                    ? { ...msg, content: accumulatedContent, reasoning: accumulatedReasoning, streaming: true }
                    : msg
                )
              );
            } else if (event === "chat" || event === "chatId" || event === "chat_created") {
              const id = payload?.chatId || payload?.id;
              if (id) {
                newServerChatId = id;
                setChats(prev => [{ _id: id, topic: payload.topic || prompt.slice(0, 40), model, updatedAt: new Date().toISOString() }, ...prev.filter(c => String(c._id) !== String(id))]);
              }
            } else if (event === "done" || event === "finish") {
              if (payload?.chatId) {
                newServerChatId = payload.chatId;
                setChats(prev => prev.map(c => String(c._id) === String(payload.chatId) ? { ...c, topic: payload.topic || c.topic } : c));
              }
              setMessages((prev) =>
                prev.map((msg) =>
                  msg._id === assistantMsgId
                    ? {
                        ...msg,
                        content: payload?.reply || payload?.content || accumulatedContent,
                        reasoning: payload?.reasoning || accumulatedReasoning,
                        streaming: false,
                        usage: payload?.usage,
                        _id: payload?.messageId || msg._id,
                      }
                    : msg
                )
              );
            } else if (event === "error") {
              throw new Error(payload?.message || "An error occurred.");
            }
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to send message.");
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === assistantMsgId
                ? {
                    ...msg,
                    content:
                      accumulatedContent ||
                      "*(Error generating response. Please try again.)*",
                    streaming: false,
                    error: true,
                  }
                : msg
            )
          );
        }
      } finally {
        streamsRef.current.delete(streamKey);
        setStreamingChatIds((prev) => {
          const next = new Set(prev);
          next.delete(streamKey);
          return next;
        });

        // If new chat was created, refresh chats and navigate
        if (newServerChatId && (!chatId || String(chatId) !== String(newServerChatId))) {
          await loadChats();
          navigate(`/chat/${newServerChatId}`, { replace: true });
        } else if (chatId) {
          loadChats();
        }
      }
    },
    [chatId, model, loadChats, navigate]
  );

  const handleDeleteChat = useCallback(
    async (idToDelete) => {
      try {
        await api.deleteChat(idToDelete);
        setChats((prev) => prev.filter((c) => String(c._id) !== String(idToDelete)));
        if (String(chatId) === String(idToDelete)) {
          newChat();
        }
      } catch (err) {
        setError(err.message || "Failed to delete chat.");
      }
    },
    [chatId, newChat]
  );

  const clearAllChats = useCallback(async () => {
    try {
      const deletePromises = chats.map((c) => api.deleteChat(c._id));
      await Promise.allSettled(deletePromises);
      setChats([]);
      newChat();
    } catch (err) {
      setError(err.message || "Failed to clear conversations.");
    }
  }, [chats, newChat]);

  const editUserMessage = useCallback(
    async (msgId, newText) => {
      // Find message and re-send
      send(newText);
      return true;
    },
    [send]
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId: chatId,
        messages,
        loadingChats,
        loadingMessages,
        error,
        setError,
        model,
        setModel,
        webSearch,
        setWebSearch,
        toggleWebSearch,
        MODELS: activeModels,
        MODEL_METADATA: modelMetadata,
        draft,
        setDraft,
        send,
        stopStreaming,
        isSending,
        streamingChatIds,
        newChat,
        searchQuery,
        setSearchQuery,
        deleteTarget,
        setDeleteTarget,
        handleDeleteChat,
        clearAllChats,
        editUserMessage,
        loadChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
