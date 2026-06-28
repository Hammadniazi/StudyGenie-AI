# StudyGenie AI

An AI-powered study companion that transforms your study materials into flashcards, quizzes, summaries, personalized study plans, and gives you access to a 24/7 AI tutor — all in one place.

Built with **Next.js 16**, **Google Gemini 2.5 Flash**, and **Supabase**.

---

## Features

| Feature | Description |
|---|---|
| **Upload & Analyze** | Upload PDF or TXT files (up to 10 MB) or paste text directly. AI returns an executive summary, learning objectives, key definitions, important facts, and a quick revision sheet. |
| **Flashcard Generator** | AI creates flip-card flashcards from your material with difficulty tags and topic labels. Save favourites. Filter by difficulty. |
| **Quiz Generator** | Generates mixed-format quizzes (multiple choice, true/false, short answer) from your material. Immediate results with per-question explanations and weak-area detection. |
| **AI Tutor** | Conversational Socratic tutor powered by Gemini. Guides you to understand concepts rather than just giving answers. Supports topic scoping and multi-turn conversations. |
| **Study Planner** | Enter your subject, exam date, and daily hours. AI produces a day-by-day and week-by-week plan with task types (study, revision, quiz, flashcards) and durations. |
| **Analytics** | Visual dashboard with study hours bar chart, quiz accuracy trend line, topic mastery radar chart, streak heatmap, and weak-area recommendations. |
| **Guest Mode** | Every page works without an account using demo data — no sign-up required to explore the full UI. |
| **Dark / Light Theme** | Toggle in the header. Dark by default. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI primitives + custom component layer |
| Animations | Framer Motion |
| Charts | Recharts |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Auth | Supabase (`@supabase/ssr`) |
| PDF Parsing | pdf-parse v2 (Node.js runtime, class-based API) |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com) API key (free tier is sufficient)
- A [Supabase](https://supabase.com) project *(optional — the app runs fully in guest mode without it)*

### 1. Clone and install

```bash
git clone https://github.com/Hammadniazi/studygenie-ai.git
cd studygenie-ai
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Required — powers all AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — enables user accounts and auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> If the Supabase variables are absent or empty, the app skips authentication entirely and runs in guest mode with demo data. All AI features still work as long as `GEMINI_API_KEY` is set.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Login & Register pages (split-panel layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                   # All app pages (authenticated or guest)
│   │   ├── layout.tsx           # Server component — fetches Supabase user, passes to AppLayout
│   │   ├── dashboard/page.tsx
│   │   ├── upload/page.tsx      # File upload, PDF parsing, AI analysis
│   │   ├── flashcards/page.tsx
│   │   ├── quizzes/page.tsx
│   │   ├── tutor/page.tsx
│   │   ├── study-planner/page.tsx
│   │   └── analytics/page.tsx
│   ├── api/                     # API routes (Node.js runtime only)
│   │   ├── analyze/route.ts
│   │   ├── flashcards/generate/route.ts
│   │   ├── quiz/generate/route.ts
│   │   ├── tutor/route.ts
│   │   ├── study-plan/generate/route.ts
│   │   └── parse-pdf/route.ts   # Extracts text from uploaded PDFs
│   ├── layout.tsx               # Root layout — font, metadata, global Toaster
│   └── page.tsx                 # Public landing page
├── components/
│   ├── layout/                  # AppLayout, Sidebar, Header, app-layout
│   └── ui/                      # Radix-based component library (Button, Card, Badge, etc.)
├── contexts/
│   └── study-data-context.tsx   # Shared flashcard & quiz state — the glue between Upload and other pages
├── services/
│   └── ai/gemini.ts             # All Gemini AI calls (one file, all model interactions)
├── lib/
│   └── supabase/                # Supabase clients: browser, server, middleware
└── types/index.ts               # Shared TypeScript interfaces
```

---

## How the AI Layer Works

All AI interactions go through `src/services/ai/gemini.ts` using `gemini-2.5-flash`. Every exported function sends a strict prompt with an embedded JSON schema and parses the response — no streaming, structured output only.

| Function | Input | Output |
|---|---|---|
| `generateSummary` | Study material text | `Summary` (executive summary, objectives, definitions, facts, revision) |
| `generateFlashcards` | Material text + count | `Flashcard[]` |
| `generateQuiz` | Material text + difficulty + count | `QuizQuestion[]` |
| `getTutorResponse` | Message history + optional context | AI reply string (Socratic teaching style) |
| `generateStudyPlan` | Subject, exam date, daily hours, topics | `{ daily_plan, weekly_plan }` |
| `generateInsights` | Analytics stats object | 3 personalised insight strings |

---

## Shared State Architecture

Flashcards and quizzes generated on the Upload page are immediately visible on the Flashcards and Quizzes pages because all three share a single `StudyDataContext` (`src/contexts/study-data-context.tsx`).

The context lives inside `AppLayout` (a client component), so it spans the entire app session without any external state library. It exposes:

- `addFlashcards(cards[])` — prepend AI-generated cards to the shared list
- `addQuiz(title, difficulty, questions[])` — prepend a new quiz
- `toggleSaveFlashcard(id)` — save/unsave a card across all views

Without this, generated content would be silently discarded when navigating away — since each page's `useState` is independent.

---

## Authentication & Guest Mode

- The Supabase middleware (`src/lib/supabase/middleware.ts`) refreshes the session cookie on every request but **never redirects** unauthenticated users. All app pages are accessible to guests.
- The `(app)/layout.tsx` server component fetches the current user from Supabase. If there is no user (or Supabase is not configured), it passes `undefined` for `userEmail` down to the client layout.
- Guests see a "Guest User" label in the sidebar with Sign In and Go to Homepage buttons. Authenticated users see their name/email and a Log Out button.

---

## PDF Parsing Notes

`pdf-parse` v2 depends on `@napi-rs/canvas`, a native Node.js binary addon. Next.js's bundler cannot bundle native addons, so `next.config.ts` marks them as external:

```ts
serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas']
```

The `/api/parse-pdf` route accepts multipart form data, converts the file buffer to a `Uint8Array`, and calls `new PDFParse({ data }).getText()`. Only text-based PDFs are supported — scanned / image-only PDFs return a `422` with a clear error message.

---

## Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Roadmap

- [ ] Supabase database integration — persist flashcards, quizzes, and study history per user
- [ ] Spaced repetition algorithm for flashcard review sessions
- [ ] Real analytics wired to actual quiz results and study sessions
- [ ] OAuth login (Google, GitHub)
- [ ] Export flashcards to Anki / PDF
- [ ] DOCX support and OCR for scanned PDFs
- [ ] Collaborative study rooms

---

## License

MIT
