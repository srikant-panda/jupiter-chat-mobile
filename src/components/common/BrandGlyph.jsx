import React from "react";

export default function BrandGlyph({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="17" fill="currentColor" />
      <path
        d="M18 30.5c7.2 4.2 20.1 4.3 28.2-.6M20.2 38.2c6.8 2.8 16.3 2.9 24.5-.1"
        fill="none"
        stroke="var(--brand-logo-detail, #ffffff)"
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.75"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="28"
        ry="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        transform="rotate(-17 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="28"
        ry="7.5"
        fill="none"
        stroke="var(--brand-logo-cut, #ffffff)"
        strokeWidth="3"
        strokeDasharray="42 140"
        strokeDashoffset="74"
        transform="rotate(-17 32 32)"
      />
    </svg>
  );
}

export function GoogleIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
