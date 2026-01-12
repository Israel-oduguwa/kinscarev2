# AGENTS.md

## Project Summary
- Next.js App Router project (TypeScript) with Tailwind CSS and shadcn/ui.
- Routes live in `src/app` (route groups like `(root)` and `(dashboard)`).
- Shared UI components are in `src/components` (shadcn in `src/components/ui`).
- Domain features are organized under `src/Providers`, `src/Caregivers`, `src/ChatWidgets`, `src/Authentication`, etc.

## Local Development
- Install: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Start: `npm run start`

## Architecture & Patterns
- Prefer Server Components by default; add `"use client"` only when needed.
- Use `next/link` and `next/image` for navigation and images.
- Avoid nested `<a>` tags; when using Radix NavigationMenu, use `asChild` with `Link`.
- Modals/dialogs should use `@/components/ui/dialog` with `open`/`onOpenChange`.
- Client data access typically flows through hooks (e.g., `useApiClient`, React Query).

## API & Cron
- API routes are implemented as route handlers under `src/app/api`.
- Cron entry points live under `src/app/api/cron` and are scheduled via `vercel.json`.
- Cron handlers proxy to the external backend base URL; update the base URL if the backend host changes.

## Configuration & Environment
- Env variables are referenced in `next.config.ts` and various providers (Clerk, Stripe, Intercom, Mixpanel, etc.).
- Put secrets in `.env.local`. Use `NEXT_PUBLIC_` only for values needed in the client.
- Image remote domains are allowed broadly via `next.config.ts`.

## Testing
- No test runner is configured in `package.json`. Use manual QA unless tests are added explicitly.

## Change Guidelines
- Keep edits minimal and focused; avoid reformatting unrelated code.
- Prefer `rg` for search.
- TypeScript build errors are currently ignored in `next.config.ts`; still fix types for your changes.
