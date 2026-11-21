import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getModels, streamMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import Transcript from "../components/chat/Transcript";
export default function TemporaryChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("Temporary chat");
  const controller = useRef(null);
  const bottom = useRef(null);
  useEffect(() => {
    let active = true;
    getModels()
      .then((data) => {
        if (active) {
          setModels(data.models || []);
          setModel(data.defaultModel || data.models?.[0]?.modelId || "");
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);
  const clear = () => {
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
    setMessages([]);
    setDraft("");
    setError("");
    setTitle("Temporary chat");
  };
  useEffect(() => {
    if (!user) clear();
  }, [user?.id]);
  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim() || busy || !user || !model) return;
    const content = draft.trim();
    const history = messages
      .filter((m) => !m.error && m.content)
      .map(({ role, content }) => ({ role, content }));
    const id = crypto.randomUUID();
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    setDraft("");
    setMessages((old) => [
      ...old,
      { role: "user", content },
      { _id: id, role: "assistant", content: "", streaming: true },
    ]);
    let full = "";
    let completed = false;
    try {
      await streamMessage({
        content,
        model,
        temporary: true,
        history,
        signal: request.signal,
        onEvent: (event, data) => {
          if (request.signal.aborted || controller.current !== request) return;
          if (event === "error") throw new Error(data.message);
          if (event === "token") {
            full += data.text || "";
            setMessages((old) =>
              old.map((m) => (m._id === id ? { ...m, content: full } : m)),
            );
          }
          if (event === "done") {
            completed = true;
            setTitle(data.topic || "Temporary chat");
            setMessages((old) =>
              old.map((m) =>
                m._id === id
                  ? { ...m, content: data.reply || full, streaming: false }
                  : m,
              ),
            );
          }
        },
      });
      if (!completed && !request.signal.aborted)
        throw new Error("The response ended early. Please try again.");
    } catch (err) {
      if (controller.current === request) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setDraft(content);
        }
        setMessages((old) =>
          old.map((m) =>
            m._id === id
              ? {
                  ...m,
                  streaming: false,
                  error: true,
                  content: full || "Response stopped.",
                }
              : m,
          ),
        );
      }
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setBusy(false);
      }
    }
  };
  return (
    <main className="experience-page temporary-page">
      <header className="experience-topbar">
        <Link to="/">← Saved chats</Link>
        <span className="experience-badge">Temporary</span>
        <button className="experience-button secondary" onClick={clear}>
          Clear chat
        </button>
      </header>
      <div className="experience-body">
        <h1>{title}</h1>
        <p className="experience-notice">
          This conversation is kept only in this page’s memory and disappears
          when you leave or reload. It is not saved to your history or
          shareable. AI providers still receive messages; your usage limit and
          personalization still apply.
        </p>
        {!user ? (
          <p>
            Sign in from <Link to="/">the home page</Link> to start a temporary
            chat.
          </p>
        ) : (
          <>
            <label className="temporary-model">
              Model
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={busy}
              >
                {models.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            {!messages.length && (
              <div className="temporary-empty">
                <h2>A little space to think</h2>
                <p>
                  Ask a question without adding it to your saved conversations.
                </p>
              </div>
            )}
            <Transcript messages={messages} />
            <div ref={bottom} />
            {error && (
              <p role="alert" className="experience-error">
                {error}
              </p>
            )}
            <form className="temporary-composer" onSubmit={send}>
              <textarea
                aria-label="Message Jupiter"
                placeholder="Ask Jupiter…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={30000}
                disabled={busy}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    send(e);
                  }
                }}
              />
              {busy ? (
                <button
                  type="button"
                  className="experience-button secondary"
                  onClick={() => controller.current?.abort()}
                >
                  Stop
                </button>
              ) : (
                <button
                  className="experience-button"
                  disabled={!draft.trim() || !model}
                >
                  Send
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </main>
  );
}
