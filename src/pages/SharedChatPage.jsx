import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSharedChat } from "../api";
import Transcript from "../components/chat/Transcript";
export default function SharedChatPage() {
  const { token } = useParams();
  const [chat, setChat] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setChat(null);
    setError("");
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    getSharedChat(token)
      .then((data) => {
        if (active) setChat(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
      meta.remove();
    };
  }, [token]);
  return (
    <main className="experience-page">
      <header className="experience-topbar">
        <Link to="/">← Jupiter AI</Link>
        <span className="experience-badge">Shared snapshot · Read only</span>
      </header>
      <div className="experience-body">
        <h1>{chat?.title || "Shared conversation"}</h1>
        <p className="experience-hint">
          This is a snapshot shared by its owner. AI answers may contain
          mistakes.
        </p>
        {error ? (
          <p role="alert" className="experience-error">
            {error}
          </p>
        ) : chat ? (
          <Transcript messages={chat.messages} />
        ) : (
          <p role="status">Loading conversation…</p>
        )}
      </div>
    </main>
  );
}
