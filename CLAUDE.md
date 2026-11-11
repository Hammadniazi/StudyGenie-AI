# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
```

No test suite exists yet.

## Architecture

**Framework:** Next.js 16 (App Router) with React 19. Read `node_modules/next/dist/docs/` before writing any Next.js code — this version has breaking changes.

**Route groups:**
- `src/app/(auth)/` — Login & Register pages with a shared split-panel layout (`layout.tsx`). No auth guard; works with or without Supabase configured.
- `src/app/(app)/` — All authenticated/guest app pages (dashboard, tutor, upload, flashcards, quizzes, study-planner, analytics). Layout at `src/app/(app)/layout.tsx` fetches the Supabase user server-side and passes `userEmail`/`userName` down to `AppLayout`.
- `src/app/api/` — API routes: `analyze`, `flashcards/generate`, `quiz/generate`, `tutor`, `study-plan`, `parse-pdf`.
- `src/app/page.tsx` — Public landing page.

**AI layer:** All AI calls go through `src/services/ai/gemini.ts` which wraps `@google/generative-ai`. The Gemini API key is read from `GOOGLE_GENERATIVE_AI_API_KEY` env var.

**Auth:** Supabase (`@supabase/ssr`). The middleware at `src/lib/supabase/middleware.ts` refreshes the session cookie but does **not** redirect unauthenticated users — all app pages work in guest mode with mock/demo data. If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or empty, Supabase is skipped entirely (`isSupabaseConfigured()` guard in `src/lib/supabase/client.ts`).

**Guest mode:** When `userEmail` is `undefined`, the sidebar shows a guest-session card (work saved in this browser) with Create account and Sign in buttons. The sidebar logo links to `/` for guests, `/dashboard` for authenticated users.

**Shared UI:** Radix UI primitives wrapped in `src/components/ui/`. Layout components are `src/components/layout/` (app-layout, sidebar, header). Brand mark in `src/components/brand.tsx`; empty/example notices in `src/components/empty-state.tsx`.

**Design system ("study notebook"):** All colours are CSS variables in `src/app/globals.css` (light + `[data-theme='dark']`), mapped to Tailwind via `@theme inline`. Use tokens only — `primary`, `primary-soft`, `success|warning|danger` (+ `-soft`), `highlight`, `muted`, `border(-strong)`, `card` — never raw palette classes like `text-yellow-400`. Fonts: Fraunces (`font-display`, headings), IBM Plex Sans (body), IBM Plex Mono (`font-mono`, small labels). `.marker` = highlighter accent behind a word; use sparingly. Charts take colours from `src/lib/chart-theme.ts`. Links styled as buttons use `<Button asChild><Link/></Button>`. Avoid glassmorphism, gradients, sparkle icons and emoji.

**Theme:** `THEME_INIT_SCRIPT` (in `src/components/theme.tsx`, injected in the root layout `<head>`) sets `<html data-theme>` before paint from localStorage (`sg-theme`) or the OS preference. `ThemeToggle` / `useTheme()` read and write that attribute.

**PDF parsing:** Uses `pdf-parse` v2 (ESM, class-based API). `next.config.ts` must list `serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas']` — pdf-parse v2 depends on `@napi-rs/canvas` (a native `.node` binary) which Next.js's bundler cannot bundle. The route `src/app/api/parse-pdf/route.ts` does `const { PDFParse } = await import('pdf-parse')`, then `new PDFParse({ data: Uint8Array })` and calls `.getText()`. Result has `.pages[].text` and `.total`. v1's simple function call no longer works — always use the class API.

**State:** `src/contexts/study-data-context.tsx` is a localStorage-backed store (`useSyncExternalStore`, key `sg-study-data-v1`) holding materials, flashcards, quizzes, quiz attempts and an activity log, plus derived `stats` (streak, topic mastery, averages). Example content has ids prefixed `example-` (`isExample()`), is labelled in the UI, and is never counted in stats. There is no database integration yet beyond auth.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```
