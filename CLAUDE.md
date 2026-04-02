# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BRL Transcritor — a video transcription tool by BRL Educação. Users paste a YouTube or Instagram video URL, the backend downloads the video with yt-dlp, transcribes it via AssemblyAI, and returns a `.docx` file for download. Originally scaffolded from Google AI Studio.

## Commands

### Frontend

- `npm run dev` — Start Vite dev server on port 3000 (host 0.0.0.0)
- `npm run build` — Production build via Vite
- `npm run lint` — Type-check with `tsc --noEmit` (no ESLint)
- `npm run clean` — Remove `dist/`

### Backend

- `cd backend && uvicorn main:app --reload --port 8000` — Start FastAPI dev server
- Backend requires `ASSEMBLYAI_API_KEY` in `backend/.env`
- System dependencies: `yt-dlp`, `ffmpeg`, Node.js (yt-dlp uses it)

### Docker

- `docker compose up --build` — Run full stack (frontend on :80, backend on :8000)

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite` plugin, theme in `src/index.css` via `@theme`), Motion (Framer Motion), Lucide React icons, Sora font
- **Backend:** FastAPI (Python 3.12), AssemblyAI API for transcription, yt-dlp for video download, python-docx for .docx generation

## Architecture

### Frontend (`src/App.tsx`)

Single-component app. All UI and logic lives in one file:

- `App` manages form state, submits the video URL to the backend, and displays a success modal (portaled to `document.body`) with a download link.
- `fetchVideoTitle` fetches the YouTube oEmbed title before submission.
- `WEBHOOK_URL` resolves from `VITE_API_URL` env var or falls back to a relative path (`/webhook/...`), which Vite proxies to the backend in dev mode.
- In dev, Vite proxies `/webhook` and `/download` routes to `http://localhost:8000` (configured in `vite.config.ts`).

### Backend (`backend/main.py`)

FastAPI app with a pipeline: download video (yt-dlp) → upload to AssemblyAI → poll for transcription → save as `.docx` → serve for download.

- **Sync endpoint** `POST /webhook/transcrever-video/sync` — waits for full pipeline, returns `{ message, link }`. This is what the frontend uses.
- **Async endpoint** `POST /webhook/transcrever-video` — returns a `job_id`, processes in background. Poll via `GET /webhook/transcrever-video/status/{job_id}`.
- `GET /download/{filename}` — serves transcription `.docx` files from the `transcricoes/` directory.
- `GET /transcricoes` — lists all available transcription files.
- Jobs are tracked in-memory (dict), not persisted.

### Deployment

- Frontend Dockerfile: multi-stage build (Node → Nginx), serves SPA on port 3000.
- Backend Dockerfile: Python 3.12-slim with Node.js and ffmpeg installed for yt-dlp.
- `docker-compose.yml` runs both services; backend stores transcriptions in a named volume.

## Key Details

- All user-facing text is in **Brazilian Portuguese**.
- `translate="no"` is set on both `<html>` and the root `<div>` to prevent browser auto-translation.
- Path alias: `@` maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`).
- `GEMINI_API_KEY` in `.env.local` is injected via Vite's `define` config (inherited from AI Studio scaffold, not currently used).
