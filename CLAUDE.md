# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BRL Transcritor — a video transcription tool by BRL Educação. Users paste a YouTube or Instagram video URL, which is sent to an n8n webhook for processing. The transcription result links to a Google Drive folder. Built with Google AI Studio and originally scaffolded from it.

## Commands

- `npm run dev` — Start dev server on port 3000 (host 0.0.0.0)
- `npm run build` — Production build via Vite
- `npm run lint` — Type-check with `tsc --noEmit` (no ESLint)
- `npm run clean` — Remove `dist/`

## Tech Stack

- **React 19** with TypeScript (single-page app, no router)
- **Vite 6** for bundling and dev server
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config` file; theme configured in `src/index.css` using `@theme`)
- **Motion** (formerly Framer Motion) for animations
- **Lucide React** for icons
- **Sora** as the primary font family

## Architecture

This is a single-component app. All UI and logic lives in `src/App.tsx`:

- `App` component manages form state, submits the video URL to the webhook (`WEBHOOK_URL` constant), parses the response, and displays a success modal via `createPortal` to `document.body`.
- `fetchVideoTitle` fetches the YouTube oEmbed title before submission.
- The webhook URL is hardcoded as a constant at the top of `App.tsx`.
- The success modal with the Drive link is portaled outside the main DOM tree to avoid z-index/overflow issues.

## Key Details

- All user-facing text is in **Brazilian Portuguese**.
- `translate="no"` is set on both `<html>` and the root `<div>` to prevent browser auto-translation.
- Path alias: `@` maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`).
- Environment: `GEMINI_API_KEY` is defined in `.env.local` and injected via Vite's `define` config (inherited from AI Studio scaffold, not currently used by the app).
