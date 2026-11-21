# Jupiter Chat Mobile 📱

Jupiter Chat Mobile is a dedicated, mobile-first AI chat application engineered specifically for smartphones, foldables, and tablets across all known widths and heights.

## 🚀 Key Mobile Features

1. **True Mobile-First Responsive UI**:
   - Built for all screen widths: from ultra-compact screens (320px–360px), standard smartphones (375px–430px), to foldables and tablets (540px–768px+).
   - Handles dynamic screen heights, landscape orientations, notches, Dynamic Island, and virtual on-screen keyboards using dynamic viewport units (`100dvh`, `interactive-widget=resizes-content`) and safe area insets (`env(safe-area-inset-*)`).
   - Ergonomic thumb-zone touch targets meeting Apple HIG and Google Material guidelines (minimum 44x44px touch targets).

2. **ChatGPT-Style Full-Screen Settings**:
   - Opens as a **100% full-screen mobile view** (`100vw`, `100dvh`), instead of a floating desktop modal overlay.
   - Mobile navigation header with `< Settings` / Done button.
   - Organized into native iOS/Android-style card groups:
     - **Profile & Account Card**: User avatar, name, email, subscription tier tag, token usage bar with remaining quota, and account management.
     - **Appearance**: Theme switcher (Dark, Midnight, Aurora, Light, System) with live preview; 5 accent color swatches (Blue, Cyan, Violet, Amber, Rose); Segmented font size controls (Compact, Default, Large, Extra Large).
     - **Chat & Input**: Native toggle switches for Prism syntax highlighting, voice dictation, and haptic feedback.
     - **Data Controls**: Export chat history to JSON, and clear all conversations with confirmation action sheets.
     - **Security & Session**: Log out and Delete Account with confirmation sheets.
     - **About**: Version information, Terms, and Privacy.

3. **Touch Gestures & Mobile Navigation**:
   - **Swipe right** anywhere on the chat feed to smoothly reveal the conversation history drawer.
   - **Swipe left** to dismiss the drawer.
   - Touch-action optimization without 300ms click delay.
   - Tactile haptic feedback support via Web Vibration API.

4. **Model Selection Bottom Sheet**:
   - Tap the top-bar model pill to slide up a sleek bottom sheet displaying available models (Jupiter Free, Gemini 2.0 Flash, GPT-4o Mini, Claude 3 Haiku, Llama 3.3).

5. **Streaming & Markdown Rendering**:
   - Real-time Server-Sent Events (SSE) streaming with live cursor animation.
   - Markdown support with tables wrapped in horizontal touch-scroll wrappers so tables never break screen width.
   - Syntax-highlighted code blocks with single-tap copy button and copy confirmation feedback.
   - Quick-starter suggestion prompt chips on new chat screens.
   - Floating scroll-to-bottom and "Generating..." indicators.

6. **Authentication & PWA Support**:
   - Clean mobile auth bottom sheet for Sign In, Sign Up, and Google OAuth.
   - Age verification sheet for compliance.
   - Standalone PWA manifest and web app meta tags for "Add to Home Screen".

## 🛠️ Getting Started

### Development
```bash
cd jupiter-chat-mobile
npm run dev
```

### Production Build
```bash
cd jupiter-chat-mobile
npm run build
npm run preview
```

## Temporary chats, sharing and personalization

- Use **Temporary** (the ghost icon on mobile) to open `/temporary`. Messages live
  only in that page's memory and disappear on navigation or reload. This mode still
  uses your account quota and personalization, and sends messages to the AI provider.
- Use **Share** on a completed saved conversation to preview the saved messages and
  create a public, read-only snapshot. `/share/:token` works without signing in.
  Existing links keep their original snapshot. Revoke a link to publish a new one.
- Settings now support a display name and profile photo, saved personal instructions,
  and **Privacy & sharing** controls for copying/revoking existing links. On mobile,
  profile editing is under Account Details, with personalization and privacy sections
  on the main settings screen. Photo formats: PNG, JPEG or WebP under 600 KB.
- Short generated titles replace the initial question excerpt after the first answer.

Set `VITE_SHARE_URL` to the deployed web app's public origin for Android builds.
Browser builds default to the current origin. The public frontend must serve the SPA
for `/share/*` (the web app's Vercel rewrite already handles this).

All new endpoints require the updated backend. Browser API parsing propagates SSE
errors and reads only answer text; internal structured-output JSON stays on the server.
