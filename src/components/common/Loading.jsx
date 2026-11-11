import React from "react";
import BrandGlyph from "./BrandGlyph";

export default function Loading({ message = "Connecting to Jupiter AI…" }) {
  return (
    <div className="mobile-loading-screen">
      <div className="mobile-loading-brand">
        <BrandGlyph size={48} className="pulsing-brand" />
        <span className="mobile-loading-title">Jupiter AI</span>
      </div>
      <div className="mobile-loading-spinner-ring" />
      <p className="mobile-loading-text">{message}</p>
    </div>
  );
}
