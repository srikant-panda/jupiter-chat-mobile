import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./MobileCodeBlock";
const components = {
  pre: ({ children }) => <div>{children}</div>,
  code: ({ className, children }) => {
    const language = /language-(\w+)/.exec(className || "")?.[1];
    const code = String(children).replace(/\n$/, "");
    return language || code.includes("\n") ? (
      <CodeBlock code={code} language={language || "text"} />
    ) : (
      <code>{children}</code>
    );
  },
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
    >
      {children}
    </a>
  ),
  // Public snapshots do not load remote tracking images.
  img: ({ alt }) => (
    <span className="experience-hint">[Image: {alt || "image"}]</span>
  ),
};
export default function Transcript({ messages }) {
  return (
    <div className="experience-transcript">
      {messages.map((message, index) => (
        <article
          className={`experience-message ${message.role}`}
          key={message._id || index}
        >
          <div className="experience-speaker">
            {message.role === "user" ? "You" : "Jupiter"}
          </div>
          <div className="experience-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {message.content || (message.streaming ? "Thinking…" : "")}
            </ReactMarkdown>
          </div>
        </article>
      ))}
    </div>
  );
}
