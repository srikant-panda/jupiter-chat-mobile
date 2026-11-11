import React, { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function MobileCodeBlock({ code, language = "text" }) {
  const [copied, setCopied] = useState(false);
  const { theme, codeHighlighting, triggerHaptic } = useTheme();

  const cleanLang = (language || "text")
    .toLowerCase()
    .replace(/^language-/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      triggerHaptic(15);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const prismTheme = theme === "light" ? themes.github : themes.vsDark;

  if (!codeHighlighting) {
    return (
      <div className="mobile-code-container">
        <div className="mobile-code-header">
          <span className="mobile-code-lang">{cleanLang}</span>
          <button
            type="button"
            className="mobile-code-copy-btn"
            onClick={handleCopy}
            aria-label="Copy code snippet"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <pre className="mobile-code-pre">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="mobile-code-container">
      <div className="mobile-code-header">
        <span className="mobile-code-lang">{cleanLang}</span>
        <button
          type="button"
          className={`mobile-code-copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check size={14} color="#10b981" />
              <span style={{ color: "#10b981" }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <Highlight
        theme={prismTheme}
        code={code.trimEnd()}
        language={cleanLang || "javascript"}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`mobile-code-pre ${className}`}
            style={{ ...style, backgroundColor: "transparent" }}
          >
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
