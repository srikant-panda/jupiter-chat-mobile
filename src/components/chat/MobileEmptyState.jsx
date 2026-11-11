import React from "react";
import { Sparkles, Code2, Lightbulb, PenTool } from "lucide-react";
import BrandGlyph from "../common/BrandGlyph";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";

const SUGGESTIONS = [
  {
    icon: Sparkles,
    label: "Explain complex concept",
    prompt: "Explain how neural networks learn in simple, intuitive terms with a good analogy.",
  },
  {
    icon: Code2,
    label: "Write a React hook",
    prompt: "Write a custom React hook `useDebounce` with full TypeScript and usage example.",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm startup ideas",
    prompt: "Brainstorm 5 creative micro-SaaS business ideas for remote software engineers.",
  },
  {
    icon: PenTool,
    label: "Draft a concise message",
    prompt: "Draft a polite, professional follow-up email after a project kickoff meeting.",
  },
];

export default function MobileEmptyState() {
  const { setDraft, send } = useChat();
  const { triggerHaptic } = useTheme();

  const handleSelectSuggestion = (promptText) => {
    triggerHaptic(15);
    setDraft(promptText);
  };

  return (
    <div className="mobile-empty-state">
      <div className="mobile-empty-hero">
        <div className="mobile-empty-glyph-ring">
          <BrandGlyph size={44} className="mobile-empty-glyph" />
        </div>
        <h1 className="mobile-empty-title">What can I help with?</h1>
        <p className="mobile-empty-subtitle">
          Ask questions, brainstorm ideas, write code, or create content with Jupiter AI.
        </p>
      </div>

      <div className="mobile-suggestions-grid">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              className="mobile-suggestion-card"
              onClick={() => handleSelectSuggestion(item.prompt)}
            >
              <div className="mobile-suggestion-icon">
                <Icon size={16} />
              </div>
              <div className="mobile-suggestion-content">
                <span className="mobile-suggestion-label">{item.label}</span>
                <span className="mobile-suggestion-desc">{item.prompt}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
