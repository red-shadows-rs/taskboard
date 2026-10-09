# TaskBoard — Audit & Cleanup Handoff

> **Operating Rules for the receiving model — read this block first, then the entire file before touching anything.**
>
> 1. Read the whole file before making any change. Do not skim.
> 2. Make **one small change at a time**, then run the verification command for that step, then continue. Never batch unrelated edits.
> 3. Never refactor, rename, reformat, or delete anything that the current step does not explicitly require.
> 4. Never overwrite a file wholesale. Use targeted edits. Commit or back up before any risky change (`git stash`, `git commit`, or a copy).
> 5. Never invent file paths, functions, APIs, or package names. Verify they exist first (`ls`, `read`, `grep`, `npm ls`).
> 6. If a step fails **twice**, STOP. Record it under section 5 "Failed Attempts" and report to the user. Do not improvise.
> 7. Never print, log, commit, or hard-code secrets. Use placeholders like `<SESSION_SECRET>`. **Never modify the value inside `.env.local`.**
> 8. The user speaks **Arabic** and expects replies in Arabic. Keep code, commands, file names, and this file in English.
> 9. The user granted broad approval for the audit, but treat any **new** destructive or scope-expanding action (deleting files, upgrading majors, pushing to remotes) as requiring a fresh check-in.

---

# 1) Goal

## Plain-language objective

Audit the TaskBoard web application for bugs, security issues, dead code, and comment policy; write a precise fix plan; then execute that plan safely without breaking the working app. A second round, requested by the user, added: fix dependency vulnerabilities first and then upgrade packages, add a real Content-Security-Policy, gate the `/api/locales` endpoint without breaking the login page, enforce a minimum `SESSION_SECRET` length, fix task-attachment image handling, and add an automated test suite.

## The user's original request (verbatim, in English)

> "You are a careful senior engineer. You will audit an entire project, write a precise fix plan, then execute that plan safely. Follow every phase in order. Do not skip phases. Do not improvise. Assume you can break working code with one careless edit, so verify before and after every change.
>
> The user speaks Arabic: reply to the user in Arabic, but keep code, commands, file names, and the generated markdown files in English."

The deliverables it demanded were `audit-report.md`, `fix-plan.md`, `cleanup-log.md`, and a final report; the phases were 0 (safety net/baseline) through 8 (final verification). After that, the user sent follow-up directives in Arabic (paraphrased): "Fix the vulnerabilities first, then upgrade the packages" (F-001…F-005); "add the header" (F-007 CSP); "gate it but do not break the login page" (F-014); "separate/choose the best for it" (F-012 secret length); "do the best for it" (F-020 attachments); and "automated tests in the project". Later the user approved the Tailwind migration (F-003) and then, after the evidence, chose option "a" — accept the dev-only `braces` advisory — and approved documenting the rate-limiter scope (F-018).

## Why it matters / who it is for

TaskBoard is a self-hosted, bilingual (Arabic/English) team task-management web app built with Next.js. It is the user's real project (repository owner: `red-shadows-rs` / local author `Shadow-x78`). Security, correctness, and a clean codebase matter because it handles authentication sessions and user data, and it is intended to be deployed.

## Definition of "done" (testable checklist)

- [ ] `git status` shows a clean working tree on branch `audit-cleanup`.
- [ ] `npm run check:comments` prints `comment policy holds` and exits `0`.
- [ ] `npm run check:versions` prints `check-versions: all version locations agree on 4.1.0` and exits `0`.
- [ ] `npm run format:check` prints `All matched files use Prettier code style!` and exits `0`.
- [ ] `npm run lint` exits `0`.
- [ ] `npm run type-check` exits `0`.
- [ ] `npm test` prints `Test Files 5 passed (5)` and `Tests 22 passed (22)` and exits `0`.
- [ ] `npm run build` exits `0` (the two warnings noted in section 2 are acceptable).
- [ ] `npm audit` reports `6 high severity vulnerabilities` (the single accepted dev-only `braces` chain), with **zero** runtime/production advisories.
- [ ] `npm run dev` serves `/login` with HTTP `200`, `/` redirects to `/login` (HTTP `307`), `/api/locales` returns `401` when unauthenticated, and `/login` responses include a `Content-Security-Policy` header.
- [ ] `audit-report.md`, `fix-plan.md`, `cleanup-log.md`, and this `handoff.md` exist and reflect the final state.

## Constraints

- **Language/framework:** TypeScript 5, Next.js 16 (App Router, Turbopack), React 18.3.1, Tailwind CSS 3.4, Zustand 4, Zod 3, `@huggingface/transformers` v4 (local NLLB-200 translation).
- **Runtime:** Node.js `v24.18.0`, npm `12.0.2`. OS: Linux (`/home/shadow-x7/...`), shell `/usr/bin/zsh`.
- **Data store:** flat JSON files in `databases/` (no real database server). See section 2.
- **Style rules (enforced by the repo's own scripts):**
  - **No comments in code files** (`src/**`, `scripts/*.mjs`, `*.css`, `*.html`). This is enforced by `scripts/check-comments.sh`. Credit/attribution banners at the top of shell scripts are allowed; shebang lines are allowed; `#` inside strings is not a comment.
  - Prettier formatting is mandatory (`npm run format:check`).
  - Version strings must agree across `package.json`, `README.md`, `README_AR.md`, `CHANGELOG.md` (enforced by `scripts/check-versions.sh`).
- **Security requirements:** no hard-coded secrets; `.env.local` is git-ignored and its value must never be read into logs or modified; all mutating APIs require auth; attachments must not be publicly served.
- **User preference:** replies in Arabic; code/commands/filenames/markdown in English.

## Out of scope (must NOT be done)

- Do **not** migrate Tailwind CSS 3 → 4 (proven not to fix anything; see section 5).
- Do **not** run `npm audit fix --force` (it would install breaking majors and downgrade `@next/eslint-plugin-next`).
- Do **not** touch `.env.local`, `.env`, `models/`, `public/locales/**`, `public/css/**`, `public/webfonts/**`, `public/fonts/**`, `LICENSE`, or `package-lock.json` by hand.
- Do **not** push to, or merge, the `TaskBoard/master`, `TaskBoard/dev`, `TaskBoard/graph_opt`, or `TaskBoard/pr-784` remote branches (they are an unrelated repository — see section 2 "Repository lineage warning"). Do **not** merge the orphan tag `v4.1.1`.
- Do **not** delete `audit-report.md`, `fix-plan.md`, `cleanup-log.md`, or this file.

---

# 2) Current State

## What works now (verified on 2026-10-09, HEAD `3676e317`)

- `npm run check:comments` → `comment policy holds`, exit 0.
- `npm run check:versions` → `check-versions: all version locations agree on 4.1.0`, exit 0.
- `npm run format:check` → `All matched files use Prettier code style!`, exit 0.
- `npm run lint` → exit 0, no output.
- `npm run type-check` → exit 0, no output.
- `npm test` → `Test Files 5 passed (5)`, `Tests 22 passed (22)`, exit 0.
- `npm run build` → exit 0, `✓ Compiled successfully`, `Finished TypeScript`.
- `npm run dev` → serves on port 3000; verified: `GET /` → `307` to `/login`; `GET /login` → `200`; `GET /api/locales` → `401`; `GET /login` response includes `Content-Security-Policy: default-src 'self'; ...`.
- `npm audit` → `6 high severity vulnerabilities` (all the accepted dev-only `braces` chain).

## What is broken

- **No functional breakage is known.** The app builds, starts, authenticates, and serves.
- **Two non-fatal build warnings (acceptable, do not treat as errors):**
  1. `⚠ React 18 support is deprecated in Next.js 16 and will be removed in Next.js 17. Please upgrade to React 19.` (pre-existing; upgrading React is a separate project.)
  2. ```
     Turbopack build encountered 1 warning:
     ./src/app/api/tasks/[id]/image/route.ts:122:24
     Warning: Dynamic filesystem access causes tracing of the whole project
     ```
     This warning was introduced by the F-020 change (attachments moved to `uploads/`). It is cosmetic (build still exits 0). A possible fix is listed in section 6, but it is optional.
- **6 remaining `npm audit` advisories** (`braces` chain): accepted by the user (option "a"). Not "broken"; documented.

## What is untested

- No automated tests exist for API route handlers, auth/session flow, database layer, PDF export, or the React components (beyond the small utility tests). These were verified manually during the audit (see section 4) but have no regression tests.
- `UNVERIFIED:` behavior under multiple server instances (the rate limiter is per-process; see F-018).
- `UNVERIFIED:` the `@huggingface/transformers` v4 upgrade under a fresh model download (`npm run models:download`); only local-model inference was verified.

## Environment

- **Project root:** `/home/shadow-x7/Projects/Websites/Typescript/Next.js/TaskBoard`
- **OS:** Linux. **Shell:** `/usr/bin/zsh`.
- **Node:** `v24.18.0`. **npm:** `12.0.2`.
- **Install:** `npm install` (exit 0; prints `npm warn install-scripts` about blocked install scripts for `core-js`, `onnxruntime-node`, `protobufjs`, `sharp` — expected, not an error).
- **Run (dev):** `npm run dev` → `http://localhost:3000` (Turbopack). **Port:** 3000.
- **Run (prod):** `npm run build` then `npm start`.
- **Test:** `npm test` (Vitest). Config: `vitest.config.mts`.
- **Env variable NAMES (never real values):**
  - `.env.local` (git-ignored, present): `SESSION_SECRET=<SESSION_SECRET>` only. **DO NOT TOUCH.**
  - `.env.example` (tracked template) keys: `NODE_ENV`, `SESSION_SECRET`, `TRUST_PROXY`, `TRANSLATION_ENABLED`, and a commented `TRANSLATION_MODELS_DIR`.
  - Code also reads `TRANSLATION_MODELS_DIR` (optional, defaults to `./models`).
- **Config files:** `next.config.ts` (CSP + security headers + `/images` rewrite + `serverExternalPackages`), `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, `translation.config.json`, `vitest.config.mts`.
- **Services/databases:** none external. Storage = JSON files under `databases/` (`projectsDatabase.json`, `sectionsDatabase.json`, `tasksDatabase.json`, `usersDatabase.json`; all currently `[]`). User uploads go to `uploads/` (git-ignored, created on first upload; **does not currently exist**). The local translation model lives in `models/` (~870 MB, git-ignored, already downloaded).

## Architecture overview

- **Entry points:** `src/app/layout.tsx` (root layout/providers), `src/app/page.tsx` (redirects `/` → `/login`), `src/proxy.ts` (Next middleware; build output shows `ƒ Proxy (Middleware)`).
- **Pages:** `src/app/login/page.tsx`, `src/app/dashboard/**` (tasks, projects, analytics, team), `src/app/profile/**`.
- **API routes (19 handlers)** under `src/app/api/**`: auth (`login`, `logout`, `me`), `projects`, `sections` (+reorder), `tasks` (+reorder, `[id]/image` upload), `users` (+reorder), `images/[...path]` (authenticated file serving), `locales`, `translate`.
- **Shared layer:** `src/app/api/shared/` = `databaseShared.ts` (JSON read/write, retry, business helpers), `accessShared.ts` (authorization/ownership), `rateLimitShared.ts` (in-memory limiter), `validatorsShared.ts` (Zod schemas), `storageShared.ts` (upload dir helpers).
- **Auth:** `src/app/api/auth/utilsAuth.ts` — HMAC-SHA256 signed `taskboard_session` cookie, `requireAuth()`, `requireLeaderOrClient()`, bcrypt password hashing.
- **Data flow:** browser → Next route handler → `requireAuth()` → `databaseShared` (read/write JSON) → JSON response. Translation: client form → `POST /api/translate` → `src/lib/translationServer.ts` → local ONNX model. Attachments: client uploads → `POST /api/tasks/[id]/image` (sharp → WebP) → stored in `uploads/` → served by `GET /images/<path>` (rewritten to `GET /api/images/[...path]`, auth-gated).
- **UI:** `src/components/{common,pages,layouts,ui}`, contexts in `src/contexts/` (`languageContext`, `storeContext`), utilities in `src/utils/` (`pdfUtil`, `pricingUtils`, `textScriptUtil`, `translateFormUtil`).

## Repository lineage warning (IMPORTANT)

- The working branch is `audit-cleanup`; its base is tag `pre-audit` = commit `ef7781d9` = local `main` = `remotes/TaskBoard/main`. This is the correct lineage (`taskboard`, version `4.1.0`, **JSON-file** storage).
- The remote named `TaskBoard` has **unrelated** branches: `TaskBoard/master`, `TaskBoard/dev`, `TaskBoard/graph_opt`, `TaskBoard/pr-784` contain content from a **different project** (commits mention `nvcc`, `tf::Runtime`, `reduce_by_index`). **Do not push to or merge from these.**
- The tag `v4.1.1` points to commit `db9c011c`, a **divergent, orphan lineage** (`task-board` kebab-case, described as SQLite/`better-sqlite3` storage, `data/taskboard.db`, `lib/auth`/`lib/db`). It is not reachable from any branch and does **not** match this working tree. **Do not merge it into `audit-cleanup` or `main` without an explicit user decision.**

## Known bugs / warnings / technical debt / open questions

- **Accepted debt:** 6 dev-only `braces` advisories (no patch exists). Documented in `audit-report.md`.
- **Open question (F-018):** rate limiter is in-memory/per-process; fine for single-instance, needs a shared store for multiple replicas.
- **Open question:** the `v4.1.1` divergent lineage (section above) — user must decide whether this audit should be ported there.
- **Open question:** whether to merge `audit-cleanup` into `main` / open a PR.
- **Optional:** the Turbopack dynamic-filesystem warning.

---

# 3) Active Files

## Audit deliverables (new, tracked)

| Path              | Purpose                                                                  | Status | Key content                                                               |
| ----------------- | ------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------- |
| `audit-report.md` | Full audit: baseline, inventory, findings F-001…F-022, resolution tables | new    | Findings with evidence; "Resolution status" and "Final decision" sections |
| `fix-plan.md`     | Ordered atomic tasks T-001…T-024                                         | new    | Checkbox task list, rollback commands, "Needs user decision"              |
| `cleanup-log.md`  | Log of every change, decision, and non-action                            | new    | Phases 0–8 + rounds 2–3                                                   |
| `handoff.md`      | This document                                                            | new    | —                                                                         |

## Config / tooling

| Path                                                                                                                   | Purpose                      | Status                 | Key lines / notes                                                                                                                                                                                                    | Depends on     |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `package.json`                                                                                                         | Manifest, scripts, deps      | modified               | `private: true` (line 4); `overrides` lines 8–14; `test` script line 24; deps: `@huggingface/transformers ^4.3.1` (36), `jspdf ^4.2.1` (58), `sharp ^0.35.5` (68), `uuid ^11.1.1` (70); devDep `vitest ^4.1.11` (89) | —              |
| `package-lock.json`                                                                                                    | Lockfile                     | modified               | Regenerate only via `npm install`                                                                                                                                                                                    | `package.json` |
| `next.config.ts`                                                                                                       | CSP + headers + rewrite      | modified               | CSP array lines 5–19; `serverExternalPackages` line 24; `/images/:path*` rewrite line 28; headers block ~27–56                                                                                                       | Next.js        |
| `vitest.config.mts`                                                                                                    | Vitest config                | new                    | alias `@` → `./src`; `include: ["src/**/*.test.ts"]`                                                                                                                                                                 | vitest         |
| `.gitignore`                                                                                                           | Ignore rules                 | modified               | `models/` (17), `uploads/` (20), `.env`/`.env.local` (23–24)                                                                                                                                                         | git            |
| `.env.example`                                                                                                         | Env template                 | modified               | `SESSION_SECRET=<SESSION_SECRET>` + "at least 32 characters" note (14–16); `TRUST_PROXY` (22); `TRANSLATION_ENABLED` (27)                                                                                            | —              |
| `.env.local`                                                                                                           | Local env (**DO NOT TOUCH**) | untouched-but-critical | `SESSION_SECRET=<SESSION_SECRET>`; value never modified/logged                                                                                                                                                       | app runtime    |
| `eslint.config.mjs`                                                                                                    | ESLint flat config           | untouched-but-critical | Uses `@next/eslint-plugin-next` (lines 1, 20, 32–33)                                                                                                                                                                 | —              |
| `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.prettierrc`, `.editorconfig`, `translation.config.json` | Build/style config           | untouched              | —                                                                                                                                                                                                                    | —              |
| `scripts/check-comments.sh`                                                                                            | No-comments policy guard     | modified               | Non-banner comments removed (commit `b3fc9d5b`); shebang + banner kept                                                                                                                                               | —              |
| `scripts/check-versions.sh`                                                                                            | Version consistency guard    | modified               | Non-banner comments removed                                                                                                                                                                                          | —              |
| `scripts/set-version.sh`                                                                                               | Version bump helper          | modified               | Non-banner comments removed                                                                                                                                                                                          | —              |
| `scripts/download-models.mjs`                                                                                          | Model downloader             | untouched-but-critical | No comments already                                                                                                                                                                                                  | transformers   |
| `.github/workflows/ci.yml`                                                                                             | CI                           | modified               | Added `- name: Test` / `run: npm test` after Type-check                                                                                                                                                              | npm            |

## Source files changed

| Path                                       | Status   | Key lines / exact change                                                                                                                                                      | Depends on               |
| ------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `src/app/api/auth/utilsAuth.ts`            | modified | Lines 10–24: `SESSION_SECRET` presence check + new min-length 32 check (`SESSION_SECRET_MIN_LENGTH = 32`, line 12). `requireAuth()` throws `Error("Unauthorized")` (line 116) | `databaseShared`         |
| `src/app/api/shared/rateLimitShared.ts`    | modified | `getClientIp` lines 10–21: `x-real-ip` now read **only** inside the `TRUST_PROXY === "true"` guard                                                                            | —                        |
| `src/app/api/shared/storageShared.ts`      | new      | `UPLOADS_DIR = path.join(process.cwd(), "uploads")`; `resolveAttachmentPath(attachment)` strips leading `images/`                                                             | path                     |
| `src/app/api/shared/databaseShared.ts`     | modified | `readJSON` rethrows `SyntaxError` (line 51); `deleteSection` (line 118) recomputes project `endDate` after deleting tasks                                                     | —                        |
| `src/app/api/tasks/route.ts`               | modified | POST `body.projectId` branch: removed the leader-only `assignedTo` filter (lines 92–96). GET branch (lines 19–65) unchanged                                                   | databaseShared           |
| `src/app/api/tasks/[id]/image/route.ts`    | modified | Imports `UPLOADS_DIR` (line 15); writes to `path.join(UPLOADS_DIR, projectId, sectionId)` (line 105) instead of `public/images/...`                                           | storageShared, sharp     |
| `src/app/api/tasks/[id]/route.ts`          | modified | Imports `resolveAttachmentPath`, `UPLOADS_DIR` (17–18); `isPathInside` (24); attachment delete/cleanup uses `resolveAttachmentPath` + `UPLOADS_DIR` (118, 171, 181)           | storageShared            |
| `src/app/api/images/[...path]/route.ts`    | modified | `baseDir = path.resolve(UPLOADS_DIR)` (17); `requireAuth()` (13); returns `401` on `Error("Unauthorized")` (66–67)                                                            | storageShared, utilsAuth |
| `src/app/api/locales/route.ts`             | modified | `await requireAuth()` (42); returns `401` when unauthenticated (47–52)                                                                                                        | utilsAuth                |
| `src/app/api/users/[id]/route.ts`          | modified | Password change: `isSelfChange = currentUser.id === id` (83) now gates the current-password check                                                                             | utilsAuth                |
| `src/components/pages/projectsPage.tsx`    | modified | `let displayedProjects` (323); sorts a copy `[...displayedProjects].sort(...)` (331) instead of mutating the Zustand array                                                    | —                        |
| `src/components/pages/membersPage.tsx`     | modified | Removed unused `isActive` prop from `SortableMemberCard` and its call site                                                                                                    | —                        |
| `src/components/common/sortableCommon.tsx` | modified | Line 4: `import type { Task, User } from "@/types";`                                                                                                                          | —                        |
| `src/components/common/tasksCommon.tsx`    | modified | Added `unoptimized` to attachment `<NextImage>` (lines 225, 1051, 1079)                                                                                                       | —                        |
| `src/app/error.tsx`                        | modified | Removed empty `useEffect` block and the unused `useEffect` import                                                                                                             | —                        |

## Test files (new)

| Path                                          | Lines | Covers                                                                |
| --------------------------------------------- | ----- | --------------------------------------------------------------------- |
| `src/utils/pricingUtils.test.ts`              | 99    | totals, column/project totals, formatting                             |
| `src/utils/textScriptUtil.test.ts`            | 46    | script detection, translation plan, HTML strip                        |
| `src/components/ui/utilsUi.test.ts`           | 26    | `cn`, color mappers                                                   |
| `src/app/api/shared/validatorsShared.test.ts` | 54    | login/project/task schemas incl. path-traversal rejection             |
| `src/app/api/shared/rateLimitShared.test.ts`  | 41    | rate-limit blocking; `x-real-ip` not trusted when `TRUST_PROXY` unset |

## Data / assets

| Path                                                     | Status                      | Notes                                                                                                    |
| -------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `databases/*.json`                                       | untouched (all `[]`)        | Test rows were added then reverted with `git checkout -- databases/`. Do not commit test data.           |
| `models/`                                                | untouched-but-critical      | ~870 MB, git-ignored. Do not delete.                                                                     |
| `uploads/`                                               | absent (created at runtime) | git-ignored. Created by `POST /api/tasks/[id]/image`.                                                    |
| `public/images/.gitkeep`                                 | untouched                   | Kept so the folder exists in git.                                                                        |
| `public/locales/**`                                      | untouched-but-critical      | i18n JSON; the login page falls back to a built-in list in `languageContext` when `/api/locales` is 401. |
| `public/css/**`, `public/webfonts/**`, `public/fonts/**` | untouched-but-critical      | Third-party Font Awesome + IBM Plex fonts used by the PDF export.                                        |

## Must-not-edit files (and why)

- `.env.local`, `.env` — secrets/config; git-ignored; modifying can break auth or leak secrets.
- `package-lock.json` — only change via `npm install`, never by hand.
- `public/locales/**` — translations; changes affect the whole UI and PDF.
- `public/css/font-awesome.min.css`, `public/webfonts/**` — vendored third-party assets with license banners.
- `LICENSE`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CONTRIBUTING.md` — legal/process docs.
- `databases/*.json` — real data; only touch to revert test data.

---

# 4) Changes Made

All commits are on branch `audit-cleanup`. Base: `pre-audit` = `ef7781d9`. HEAD at handoff: `3676e317`.

## Commands that changed the system

- `git checkout -b audit-cleanup` and `git -c tag.gpgsign=false tag pre-audit` (created the safety branch and tag).
- `npm install` (baseline; working tree stayed clean).
- `npm install --save-dev vitest@^4.1.11` (added the test runner).
- `npm install` after each dependency edit (sharp, uuid, jspdf, transformers) — these regenerated `package-lock.json`.
- `npx prettier --write <files>` on edited markdown/source files to keep `format:check` green.
- Temporary test data written to `databases/*.json` and an image uploaded to `uploads/`, then fully reverted (`git checkout -- databases/`, `rm -rf uploads`).
- No migrations, no service restarts, no permission changes.

## Chronological changes (per commit)

### `eb7d47ac` security: trust client IP headers only when TRUST_PROXY is set (F-006)

`src/app/api/shared/rateLimitShared.ts`, `getClientIp`. Before:

```ts
if (process.env.TRUST_PROXY === "true") {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
}

const realIp = request.headers.get("x-real-ip");
if (realIp) return realIp.trim();

return "unknown";
```

After:

```ts
if (process.env.TRUST_PROXY === "true") {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
}

return "unknown";
```

Reason: a direct client could send `X-Real-IP` to bypass per-IP limits. Verified: `npm run lint` and `npm run type-check` exit 0.

### `97f8ca70` fix: harden JSON reads, recompute project end date, avoid store mutation (F-010, F-011, F-016)

- `src/app/api/shared/databaseShared.ts` `readJSON`: added
  ```ts
  if (error instanceof SyntaxError) {
    throw error;
  }
  ```
  before the retry block, so a corrupt JSON file is not retried 3×.
- `databaseShared.ts` `deleteSection`: capture the removed section and, after deleting its tasks, recompute and persist the project `endDate`:
  ```ts
  const removed = sections.find((section) => section.id === id);
  if (!removed) return false;
  ...
  try {
    const allSections = await getSections();
    const allTasks = await getTasks();
    const projectEndDate = calculateProjectEndDate(removed.projectId, allSections, allTasks);
    if (projectEndDate) {
      await updateProject(removed.projectId, { endDate: projectEndDate, updatedAt: new Date().toISOString() });
    }
  } catch (_error) {}
  ```
- `src/components/pages/projectsPage.tsx`: `const displayedProjects` → `let displayedProjects`; `displayedProjects.sort(...)` → `displayedProjects = [...displayedProjects].sort(...)`.

### `ed96c605` chore: mark package as private (F-022)

`package.json` line 4: `"private": false` → `"private": true`.

### `a8b63d40` docs: correct security headers claim, add 4.1.0 changelog row (F-007, F-017); add audit deliverables

- `README.md` / `README_AR.md`: security-headers bullet corrected; `4.1.0` changelog row added.
- Added `audit-report.md`, `fix-plan.md`, `cleanup-log.md`.

### `0d4c8095` chore: remove dead effect and unused prop, type-only import (F-008, F-015, F-021)

- `src/app/error.tsx`: removed the empty `useEffect` block and the `useEffect` import.
- `src/components/pages/membersPage.tsx`: removed `isActive?: boolean;` and `isActive={activeId === user.id}`.
- `src/components/common/sortableCommon.tsx`: `import { Task, User }` → `import type { Task, User }`.

### `ef0b3991` fix: show all project tasks to leaders, require current password on self change (F-009, F-013)

- `src/app/api/tasks/route.ts` POST `body.projectId` branch. Before:
  ```ts
  if (user.role === "member") {
    tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
  } else if (user.role === "leader") {
    tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
  }
  ```
  After:
  ```ts
  if (user.role === "member") {
    tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
  }
  ```
- `src/app/api/users/[id]/route.ts`. Before: `if (currentUser.role !== "leader") {` guarding the current-password check. After: `const isSelfChange = currentUser.id === id;` / `if (isSelfChange) {`.

### `b3fc9d5b` chore: remove non-banner comments from shell scripts (T-012)

`scripts/check-comments.sh`, `scripts/check-versions.sh`, `scripts/set-version.sh`: removed descriptive `#` comments; kept shebang (line 1) and the credit banner (lines 2–5). No `#` inside strings/awk touched.

### `13b78c4c`, `56b15d52`, `3676e317` docs updates

Updated `audit-report.md`, `fix-plan.md`, `cleanup-log.md` with execution results, the F-003 investigation, and the final decision.

### `a213cc15` test: add vitest suite

Added `vitest.config.mts` (as `.mts`, not `.ts` — see section 5), the 5 test files, `"test": "vitest run"`, and `vitest` devDependency.

### `1a8506c2` security: enforce a 32-character minimum SESSION_SECRET (F-012)

`src/app/api/auth/utilsAuth.ts` after the presence check:

```ts
if (SESSION_SECRET.length < SESSION_SECRET_MIN_LENGTH) {
  throw new Error(
    `SESSION_SECRET must be at least ${SESSION_SECRET_MIN_LENGTH} characters long.`,
  );
}
```

`.env.example` and both READMEs updated to state the minimum. Verified the current local secret (64 chars) and the CI secret (43 chars) both pass.

### `8f5921e5` security: add Content-Security-Policy (F-007)

`next.config.ts`: built `contentSecurityPolicy` and set it as a header on `/:path*`. After the first attempt broke Google Fonts (see section 5), `style-src` allows `https://fonts.googleapis.com` and `font-src` allows `https://fonts.gstatic.com`; `script-src` adds `'unsafe-eval'` and `connect-src` adds `ws: wss:` **only in dev**. Verified the header is present and the login page renders with 0 CSP violations.

### `ed01d52d` security: require auth for /api/locales (F-014)

`src/app/api/locales/route.ts`: added `import { requireAuth }` and `await requireAuth();` in `GET`; returns `401` when unauthenticated. Verified: unauth `GET /api/locales` → `401`; login page still renders using `languageContext`'s fallback list.

### `2b2950ff` security: store attachments outside public, serve via auth-gated route (F-020)

New `src/app/api/shared/storageShared.ts`; `tasks/[id]/image/route.ts` writes to `uploads/`; `images/[...path]/route.ts` reads from `UPLOADS_DIR`; `tasks/[id]/route.ts` deletes from `uploads/`; `tasksCommon.tsx` sets `unoptimized` on 3 `<NextImage>`s; `.gitignore` ignores `uploads/`. Verified end-to-end: unauth image → `401`, authed → `200 image/webp`, image rendered in the task dialog (`naturalWidth: 40`).

### `6527f39e` chore(deps): sharp ^0.34.5 → ^0.35.5 (F-002)

Verified: `npm audit` no longer lists sharp; sharp smoke test (`webp` output); image-upload e2e.

### `b6c129c2` chore(deps): uuid ^9.0.1 → ^11.1.1, removed `@types/uuid` (F-005)

Verified: `npm run type-check` exit 0; project creation (uuid v4) e2e.

### `39912ee3` chore(deps): jspdf ^2.5.2 → ^4.2.1 (F-001)

Verified: `npm audit` no longer lists jspdf; a browser PDF export produced a valid 136 KB, 2-page PDF with no console errors.

### `9f4fb966` chore(deps): @huggingface/transformers ^3.8.1 → ^4.3.1 (F-004)

Also added `overrides` for `postcss-selector-parser@^7.1.6` and `sprintf-js@^1.1.3`. Verified: identical translation output before/after; `/api/translate` e2e returned the same text.

### `31994936` docs(ci): run tests in CI and document round-2 fixes

`.github/workflows/ci.yml` gained a Test step; READMEs and deliverables updated.

## Decisions taken (and alternatives rejected)

- **Add tests before upgrading packages** — rejected doing upgrades without a safety net.
- **Fix code issues before dependency upgrades** — chosen so a failed upgrade is easy to isolate.
- **Upgrade `sharp`/`uuid`/`jspdf`/`transformers` individually**, one commit each — rejected a single combined `npm audit fix --force` (breaking and opaque).
- **Use npm `overrides` for `postcss-selector-parser` and `sprintf-js`** — avoided the Tailwind 4 major migration for those.
- **Gate `/api/locales` with `requireAuth()` but keep the login page working via `languageContext`'s built-in fallback list** — rejected hard-coding a bypass.
- **Move attachments to `uploads/` + `unoptimized`** — rejected leaving them in `public/` (publicly served) and rejected proxying through the optimizer (auth cookie not forwarded).
- **CSP with explicit Google Fonts allowances** — rejected a strict CSP that broke the fonts.
- **Do NOT migrate Tailwind 3 → 4** — proven not to clear the advisory (section 5).
- **Accept the dev-only `braces` advisory** (user chose option "a").

## Anything left half-done / inconsistent

- Nothing is half-done. Working tree is clean; all gates pass.
- `uploads/` does not exist until the first upload (by design).
- The Turbopack dynamic-filesystem warning remains (cosmetic).

---

# 5) Failed Attempts

1. **`vitest@5` install failed (peer dependency conflict).**
   Command: `npm install --save-dev vitest@^5.0.3`. Verbatim error:

   ```
   npm error Conflicting peer dependency: @types/node@26.6.4
   npm error   peerOptional @types/node@"^22.0.0 || >=24.0.0" from vitest@5.0.3
   ```

   Cause: the project pins `@types/node@20`; vitest 5 wants `>=22`. **Fix used:** install `vitest@^4.1.11` (peer `^20 || ^22 || >=24`). Do not retry vitest 5 unless `@types/node` is upgraded first.

2. **`vitest.config.ts` triggered a Vite CJS-config warning.**
   Symptom:

   ```
   (!) Your Vite config uses features that are unsupported by `configLoader: 'native'` ...
     - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension ...
   ```

   Cause: no `"type": "module"` in `package.json`, and the config used ESM syntax. **Fix used:** renamed the file to `vitest.config.mts`. Do not rename it back to `.ts`.

3. **First CSP broke Google Fonts.**
   Console errors on `/login`:

   ```
   [ERROR] Loading the stylesheet 'https://fonts.googleapis.com/css2?family=Inter:...' violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline'".
   [ERROR] Loading the stylesheet 'https://fonts.googleapis.com/css2?family=Cairo:...' violates the following Content Security Policy directive: "style-src 'self' 'unsafe-inline'".
   ```

   Cause: `src/app/globals.css` lines 1–2 `@import` Google Fonts. **Fix used:** allow `https://fonts.googleapis.com` in `style-src` and `https://fonts.gstatic.com` in `font-src`. Do not remove those allowances.

4. **Tailwind 3 → 4 migration does NOT fix the `braces` advisory (migration cancelled).**
   The user approved the migration, but an isolated probe (`/tmp/kilo/probe`, a `package.json` with **only** `@next/eslint-plugin-next@16.4.0`, then `npm install --package-lock-only && npm audit`) reported:

   ```
   braces  *   (high)
     micromatch  >=0.2.0  Depends on vulnerable versions of braces
       fast-glob  *        Depends on vulnerable versions of micromatch
         @next/eslint-plugin-next  >=14.3.0-canary.0  Depends on vulnerable versions of fast-glob
   4 high severity vulnerabilities
   ```

   Cause: `braces@3.0.3` has **no patched version** (`CVE-2026-93687`, "Patched versions: None"), and it is pulled by the ESLint plugin chain independently of Tailwind. **Do not retry the Tailwind migration expecting to clear the advisory.** Clearing it fully would also require removing `@next/eslint-plugin-next` (used in `eslint.config.mjs`).

5. **Playwright code snippets failed on `require`/dynamic import.**
   Errors: `ReferenceError: require is not defined` and
   `TypeError [ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING]: A dynamic import callback was not specified.`
   Cause: the snippet runs in the Playwright server VM, not a Node module scope. **Workaround used:** avoid `require`/`import`; hard-code the project id in the script. Do not retry `require(...)` inside `browser_run_code_unsafe`.

6. **`git tag pre-audit` failed initially.**
   Cause: repo has `tag.gpgsign true` but no signing key available. **Fix used:** `git -c tag.gpgsign=false tag pre-audit` (one-off override; global git config untouched).

7. **`format:check` failed after markdown edits.**
   Symptom: `[warn] README.md` / `[warn] README_AR.md` / `[warn] audit-report.md` → "Code style issues found". Cause: manual table edits changed alignment. **Fix used:** `npx prettier --write` on the touched markdown. Always re-run `npm run format:check` after editing markdown.

8. **Test data made `databases/*.json` non-Prettier-clean.**
   Symptom: `format:check` listed `databases/projectsDatabase.json` etc. Cause: e2e seeding wrote JSON with different formatting. **Fix used:** `git checkout -- databases/` to restore `[]`. Never commit seeded data.

9. **Misleading hypothesis (corrected): F-012 "README over-promises a 32-char minimum".**
   The original finding claimed the README required 32 chars while the code only checked presence. On verification, that text did **not** exist in `README.md`/`README_AR.md` (it existed only in a git-ignored `.kilo/plans/` file). The finding was corrected to a hardening suggestion, and the min-length check was then added anyway on the user's instruction. If you see the old wording referenced anywhere, it was wrong.

10. **Ruled out as causes (do not chase):** the `braces` advisory is **not** caused by Tailwind alone, by `postcss-selector-parser`, or by `sprintf-js` (those were fixed via overrides/upgrades and the advisory remained). It is solely the ESLint plugin's `fast-glob → micromatch → braces` chain.

---

# 6) Next Steps

The audit is **complete** and the user accepted the one remaining advisory. The tasks below finalize and optionally improve. Do them in order; each is atomic.

### Task 1 — Confirm the baseline is green (no change)

- **Files:** none.
- **Change:** none (verification only).
- **Verify:**
  ```bash
  cd /home/shadow-x7/Projects/Websites/Typescript/Next.js/TaskBoard
  git status --porcelain
  npm run check:comments && npm run check:versions && npm run format:check && npm run lint && npm run type-check && npm test && npm run build
  ```
- **Expected output:** `git status --porcelain` prints nothing; every npm command exits `0`; `npm test` prints `Tests 22 passed (22)`.
- **Risk:** none. **Rollback:** none needed.
- **Depends on:** nothing.

### Task 2 — Decide merge/PR of `audit-cleanup` into `main` (USER DECISION REQUIRED)

- **Files:** git refs only.
- **Change:** after the user decides, either open a PR from `audit-cleanup` → `main`, or fast-forward `main`. **Do not push to the unrelated `TaskBoard/master` etc.** (section 2).
- **Verify:** `git log --oneline main..audit-cleanup` lists the 20 audit commits; `git diff --stat pre-audit..audit-cleanup` shows the 35 files.
- **Expected output:** as above.
- **Risk:** medium (publishing). **Rollback:** `git reset --hard pre-audit` on `main` (or `git revert`), and delete the branch.
- **Depends on:** Task 1, explicit user approval.

### Task 3 (optional) — Fix the Turbopack dynamic-filesystem warning

- **Files:** `src/app/api/tasks/[id]/image/route.ts` (warning at line 122).
- **Change:** make the upload path non-dynamic for the bundler, e.g. compute `fullPath` from the already-resolved `imagesDir` without `path.join(imagesDir, filename)` being seen as dynamic, or add the `uploads` dir to Next's tracing include. Verify the exact API against the installed Next version before editing.
- **Verify:** `npm run build` and confirm the warning is gone; `npm test`.
- **Expected output:** build exits 0 with no `Dynamic filesystem access` warning.
- **Risk:** low–medium (must not break uploads). **Rollback:** `git checkout -- "src/app/api/tasks/[id]/image/route.ts"`.
- **Depends on:** Task 1.

### Task 4 (optional) — Decide the `v4.1.1` divergent lineage (USER DECISION REQUIRED)

- **Files:** none (git/planning only).
- **Change:** ask the user whether the audit should be ported onto the `v4.1.1` (`task-board`, SQLite) lineage. If yes, that is a **new, separate** effort (the storage layer differs: `databases/*.json` vs SQLite), and it must not be improvised here.
- **Verify:** n/a.
- **Risk:** high if done carelessly (divergent histories). **Rollback:** n/a.
- **Depends on:** Task 1, user decision.

### Task 5 (optional) — Expand automated test coverage

- **Files:** new `*.test.ts` under `src/`.
- **Change:** add focused tests for `src/utils/pdfUtil.ts` (pure helpers), `src/app/api/shared/databaseShared.ts` (pure helpers like `calculateProjectEndDate`), and `src/utils/translateFormUtil.ts`.
- **Verify:** `npm test` and `npm run type-check`.
- **Expected output:** all tests pass; type-check exits 0.
- **Risk:** low. **Rollback:** delete the new test files.
- **Depends on:** Task 1.

### Task 6 (optional, F-018) — Shared rate-limit store for multi-instance

- **Files:** `src/app/api/shared/rateLimitShared.ts` (+ a new store module), docs.
- **Change:** only if the user deploys multiple replicas; replace the in-memory `Map` with a shared store (e.g. Redis). Not needed for single-instance.
- **Verify:** `npm test` (add a test for the new store), `npm run build`.
- **Expected output:** exit 0.
- **Risk:** medium (new dependency/service). **Rollback:** `git checkout -- src/app/api/shared/rateLimitShared.ts` and remove the new module.
- **Depends on:** Task 1, user decision.

### Do NOT do

- Do **not** migrate Tailwind 3 → 4 (Task/attempt 4 above).
- Do **not** run `npm audit fix --force`.
- Do **not** modify `.env.local` or print its value.
- Do **not** push to `TaskBoard/master`, `TaskBoard/dev`, `TaskBoard/graph_opt`, `TaskBoard/pr-784`, or merge tag `v4.1.1`.

## Final verification checklist (matches section 1 "done")

- [ ] `git status` clean on `audit-cleanup`.
- [ ] `npm run check:comments` → `comment policy holds`.
- [ ] `npm run check:versions` → `check-versions: all version locations agree on 4.1.0`.
- [ ] `npm run format:check` → `All matched files use Prettier code style!`.
- [ ] `npm run lint` → exit 0.
- [ ] `npm run type-check` → exit 0.
- [ ] `npm test` → `Tests 22 passed (22)`.
- [ ] `npm run build` → exit 0 (two acceptable warnings only).
- [ ] `npm audit` → `6 high severity vulnerabilities` (accepted `braces` chain; no runtime advisories).
- [ ] `npm run dev` → `/login` 200, `/` 307→`/login`, `/api/locales` 401 unauth, CSP header present.
- [ ] `audit-report.md`, `fix-plan.md`, `cleanup-log.md`, `handoff.md` present.

## Global rollback

- Full rollback to before the audit: `git reset --hard pre-audit` (then `git checkout main`).
- Single commit: `git revert <hash>` (e.g. `git revert 39912ee3`).
- Restore one file: `git checkout -- <path>`.
