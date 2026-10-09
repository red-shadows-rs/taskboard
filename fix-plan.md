# TaskBoard — Fix Plan

Ordered, atomic tasks. Each task fixes exactly one finding from `audit-report.md`.
Work top-to-bottom; run the Verify command after every task; tick the checkbox; append to
`cleanup-log.md`; commit per related group.

- Branch: `audit-cleanup` · Tag: `pre-audit`
- No task may be executed before the Phase 3 CHECKPOINT approval.
- Dependency upgrades are **deferred** (see "Needs user decision"); they are not part of the
  executable sequence.

---

## Group 1 — Security (code)

- [x] T-001 (fixes F-006)
  - File(s): `src/app/api/shared/rateLimitShared.ts`
  - Change: only trust `x-real-ip` when `TRUST_PROXY === "true"`.
    Before:
    ```ts
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    return "unknown";
    ```
    After:
    ```ts
    if (process.env.TRUST_PROXY === "true") {
      const realIp = request.headers.get("x-real-ip");
      if (realIp) return realIp.trim();
    }

    return "unknown";
    ```
    (Move the `x-real-ip` read inside the existing `TRUST_PROXY` guard; do not add a new branch
    that duplicates the guard.)
  - Verify: `npm run lint && npm run type-check`
  - Expected output: both exit `0`, no output.
  - Rollback: `git checkout -- src/app/api/shared/rateLimitShared.ts`
  - Depends on: none

## Group 2 — Bugs

- [x] T-002 (fixes F-010)
  - File(s): `src/app/api/shared/databaseShared.ts`
  - Change: in `readJSON` catch block, rethrow `SyntaxError` immediately instead of retrying.
    After:
    ```ts
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "ENOENT") {
        return [];
      }
      if (error instanceof SyntaxError) {
        throw error;
      }
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return readJSON<T>(filename, retries - 1);
      }
      throw error;
    }
    ```
  - Verify: `npm run type-check`
  - Expected output: exit `0`, no output.
  - Rollback: `git checkout -- src/app/api/shared/databaseShared.ts`
  - Depends on: none

- [x] T-003 (fixes F-011)
  - File(s): `src/app/api/shared/databaseShared.ts`
  - Change: in `deleteSection`, after deleting the section's tasks, recompute and persist the
    project end date. Add inside `deleteSection` after the task cleanup:
    ```ts
    try {
      const allSections = await getSections();
      const allTasks = await getTasks();
      const projectEndDate = calculateProjectEndDate(
        section.projectId,
        allSections,
        allTasks,
      );
      if (projectEndDate) {
        await updateProject(section.projectId, {
          endDate: projectEndDate,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (_error) {}
    ```
    Note: `deleteSection` currently filters `sections` without keeping the removed section; capture
    the removed section first (`const removed = sections.find((s) => s.id === id);`) and use
    `removed.projectId`.
  - Verify: `npm run type-check`
  - Expected output: exit `0`, no output.
  - Rollback: `git checkout -- src/app/api/shared/databaseShared.ts`
  - Depends on: T-002

- [x] T-004 (fixes F-016)
  - File(s): `src/components/pages/projectsPage.tsx`
  - Change: sort a copy instead of the store array.
    Before:
    ```ts
    if (isDragEnabled) {
      displayedProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    ```
    After:
    ```ts
    if (isDragEnabled) {
      displayedProjects = [...displayedProjects].sort(
        (a, b) => (a.order || 0) - (b.order || 0),
      );
    }
    ```
    (Requires changing `const displayedProjects` to `let displayedProjects`.)
  - Verify: `npm run lint && npm run type-check`
  - Expected output: both exit `0`.
  - Rollback: `git checkout -- src/components/pages/projectsPage.tsx`
  - Depends on: none

## Group 3 — Config

- [x] T-005 (fixes F-022)
  - File(s): `package.json`
  - Change: `"private": false` → `"private": true` (line 4).
  - Verify: `node -e "process.exit(require('./package.json').private === true ? 0 : 1)"`
  - Expected output: exit `0`.
  - Rollback: `git checkout -- package.json`
  - Depends on: none

- [x] T-006 (fixes F-012) — CANCELLED: on verification the README did not actually over-promise; F-012 corrected to a hardening suggestion. No doc change needed.
  - File(s): `README.md`
  - Change: soften the `SESSION_SECRET` wording to match the code (presence check only), or add
    "recommended: at least 32 characters" instead of claiming enforcement. (The alternative —
    enforcing length in code — is deferred; see Needs user decision.)
  - Verify: `npm run check:versions`
  - Expected output: `check-versions: all version locations agree on 4.1.0`
  - Rollback: `git checkout -- README.md`
  - Depends on: none

- [x] T-007 (fixes F-007) — docs-only option
  - File(s): `README.md`
  - Change: correct the security-headers claim so it lists only the headers actually set in
    `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
    `Permissions-Policy`) — **unless** the user chooses to add a real CSP (deferred).
  - Verify: `npm run check:versions`
  - Expected output: `check-versions: all version locations agree on 4.1.0`
  - Rollback: `git checkout -- README.md`
  - Depends on: T-006

- [x] T-008 (fixes F-017)
  - File(s): `README.md` (and `README_AR.md` if its table is also stale)
  - Change: add the missing `4.1.0` (and `4.1.1`) rows to the changelog table(s), matching
    `CHANGELOG.md`.
  - Verify: `npm run check:versions`
  - Expected output: `check-versions: all version locations agree on 4.1.0`
  - Rollback: `git checkout -- README.md README_AR.md`
  - Depends on: T-007

## Group 4 — Dead code

- [x] T-009 (fixes F-008)
  - File(s): `src/app/error.tsx`
  - Change: remove the empty effect block (lines 32-35) and remove the now-unused `useEffect`
    import (line 4). Keep `error` (still used at line 70).
    Before:
    ```tsx
    import { useEffect } from "react";
    ...
    useEffect(() => {
      if (process.env.NODE_ENV === "development" && error) {
      }
    }, [error]);
    ```
    After: both removed.
  - Verify: `npm run lint && npm run type-check`
  - Expected output: both exit `0`.
  - Rollback: `git checkout -- src/app/error.tsx`
  - Depends on: none

- [x] T-010 (fixes F-015)
  - File(s): `src/components/pages/membersPage.tsx`
  - Change: remove the unused `isActive?: boolean;` field from `SortableMemberCard`'s prop type
    (line ~140) and remove `isActive={activeId === user.id}` from the call site (line ~796).
  - Verify: `npm run lint && npm run type-check`
  - Expected output: both exit `0`.
  - Rollback: `git checkout -- src/components/pages/membersPage.tsx`
  - Depends on: none

- [x] T-011 (fixes F-021)
  - File(s): `src/components/common/sortableCommon.tsx`
  - Change: `import { Task, User } from "@/types";` → `import type { Task, User } from "@/types";`
  - Verify: `npm run lint && npm run type-check`
  - Expected output: both exit `0`.
  - Rollback: `git checkout -- src/components/common/sortableCommon.tsx`
  - Depends on: none

## Group 5 — Delete unused files and code (Phase 5)

- No file qualifies for deletion.
  - Verified: every `src/**` file is either imported by another module or is a Next.js convention
    file (route/page/layout/loading/error). `src/proxy.ts` is recognized by Next 16 as the proxy
    (build output: `ƒ Proxy (Middleware)`).
  - No `*.bak`/`*.old`/`*.orig`/`*.tmp`/`*.log` files found.
  - `public/images/.gitkeep` is intentionally empty (keep).
  - All `package.json` dependencies are referenced in code (import grep).
  - → **Nothing deleted.** No task.

## Group 6 — Remove comments from code files (Phase 6)

- `src/**` and `scripts/download-models.mjs` already contain **no** comments (policy guard
  `npm run check:comments` → "comment policy holds"). No task.
- [x] T-012 (fixes the `.sh` policy conflict) — executed on explicit user approval
  - File(s): `scripts/check-comments.sh`, `scripts/check-versions.sh`, `scripts/set-version.sh`
  - Change: if approved, remove all non-banner `#` comments, keeping the shebang and the
    credit/attribution banner at the top of each file. Do **not** touch `#` inside the awk
    single-quoted string in `check-comments.sh` (it is string content, not a comment).
  - Verify: `npm run check:comments && npm run check:versions && bash -n scripts/check-comments.sh && bash -n scripts/check-versions.sh && bash -n scripts/set-version.sh`
  - Expected output: `comment policy holds`; `check-versions: all version locations agree on 4.1.0`; `bash -n` prints nothing.
  - Rollback: `git checkout -- scripts/check-comments.sh scripts/check-versions.sh scripts/set-version.sh`
  - Depends on: user approval (decision #6)

## Group 7 — Restore comments in config/env files (Phase 7)

- Already compliant; no changes required.
  - `.env.example`, `.env.local`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.github/*`
    already use the required `─` header + `# ── Section ──` style.
  - Strict JSON files (`package.json`, `tsconfig.json`, `translation.config.json`,
    `public/manifest.json`, `.prettierrc`) correctly have no comments.
  - Do **not** modify any value in `.env.local`.

## Group 8 — Final verification (Phase 8)

- [x] T-013 (final)
  - File(s): none
  - Change: run the full baseline and diff review.
  - Verify:
    ```
    npm run check:comments && npm run check:versions && npm run format:check && npm run lint && npm run type-check && npm run build
    git status
    git diff --stat pre-audit..HEAD
    ```
  - Expected output: all commands exit `0`; `git status` clean; diff contains only intended files
    and no secrets.
  - Rollback: `git reset --hard pre-audit` (full rollback) — see final report.
  - Depends on: T-001 … T-012 (as approved)

---

## Needs user decision

These are **not** in the executable sequence until the user decides.

1. **Dependency upgrades (F-001 jsPDF, F-002 sharp, F-003 postcss-selector-parser,
   F-004 sprintf-js, F-005 uuid).** All are breaking major upgrades. Recommend a separate upgrade
   effort with PDF/upload/translation regression testing. `npm audit fix --force` is explicitly
   **not** run.
2. **CSP (F-007).** Add a real `Content-Security-Policy` header (risk: breaks inline styles) or
   keep the docs-only correction (T-007).
3. **Leader task visibility (F-009).** Change `src/app/api/tasks/route.ts` POST `projectId` branch
   so leaders see all project tasks, or keep current behavior.
4. **Gate `/api/locales` (F-014).** Add `requireAuth()`, or accept the public directory listing.
   Risk: login-page translations load before a session exists.
5. **Leader own-password check (F-013).** Enforce `currentPassword` when a leader changes their own
   password.
6. **`scripts/*.sh` comments (T-012).** Strip non-banner comments per the audit's Phase 6, or keep
   them per the repo's own documented policy.
7. **`SESSION_SECRET` length (F-012).** Enforce a minimum length in code, or keep docs-only fix
   (T-006).
8. **F-020 attachment images.** Requires a manual UI test (upload + render) before any fix.
9. **No test suite.** Out of scope; recorded for awareness.

---

## Decisions (resolved)

The user granted explicit approval to proceed without further check-ins. Resolutions:

1. **Dependency upgrades (F-001…F-005): DEFERRED.** Not upgraded. The audit's own rule is "do not
   upgrade automatically"; every available fix is a breaking major version. `npm audit fix --force`
   was **not** run. Recorded for a dedicated upgrade effort.
2. **CSP (F-007): docs-only.** README/README_AR corrected to list the headers actually set. No CSP
   header added (avoids breaking Radix/Tailwind inline styles).
3. **Leader task visibility (F-009): FIXED.** Leaders now receive all tasks of a project; members
   still receive only their assigned tasks.
4. **Gate `/api/locales` (F-014): NOT CHANGED.** Gating it would break login-page translations,
   which load before a session exists. Left public; low-sensitivity disclosure accepted.
5. **Leader own-password check (F-013): FIXED.** Any user (including a leader) changing **their own**
   password must supply the current password; a leader changing another user still does not.
6. **`scripts/*.sh` comments (T-012): REMOVED** (non-banner comments), keeping shebang and the
   credit/attribution banner.
7. **`SESSION_SECRET` length (F-012): NO CHANGE.** F-012 evidence was corrected (README did not
   over-promise). `.env.example` already recommends a long random value.
8. **F-020: NOT CHANGED.** Needs a manual browser test first; no code change risked.
9. **No test suite:** acknowledged; out of scope.

---

## Round 2 — User-directed tasks (executed)

The user asked to fix the vulnerabilities first, then upgrade packages, plus CSP, `/api/locales`,
`SESSION_SECRET`, attachments, and to add automated tests. Order was chosen to add a safety net
(tests) first, then low-risk code fixes, then dependency upgrades one at a time.

- [x] T-014 Add automated test suite
  - File(s): `vitest.config.mts`, `src/**/*.test.ts` (5 files), `package.json` (`test` script),
    `.github/workflows/ci.yml`
  - Change: install `vitest@^4.1.11`; tests for pricing, text-script, validators, UI utils, rate limit
  - Verify: `npm test`
  - Expected output: `Test Files 5 passed`, `Tests 22 passed`
  - Rollback: `git checkout -- package.json package-lock.json .github/workflows/ci.yml && rm -rf src/**/*.test.ts vitest.config.mts`
  - Depends on: none

- [x] T-015 (fixes F-012) Enforce minimum `SESSION_SECRET` length
  - File(s): `src/app/api/auth/utilsAuth.ts`, `.env.example`, `README.md`, `README_AR.md`
  - Change: throw if `SESSION_SECRET.length < 32`; document the minimum
  - Verify: `npm run build`
  - Expected output: exit 0
  - Rollback: `git checkout -- src/app/api/auth/utilsAuth.ts .env.example README.md README_AR.md`
  - Depends on: none

- [x] T-016 (fixes F-007) Add a real `Content-Security-Policy`
  - File(s): `next.config.ts`
  - Change: build a CSP (self + Google Fonts; `unsafe-inline`/`unsafe-eval` only in dev) and set it as a
    response header
  - Verify: `curl -sD - -o /dev/null http://localhost:3000/login | grep -i content-security-policy`
  - Expected output: a `Content-Security-Policy:` header; login page renders with 0 CSP violations
  - Rollback: `git checkout -- next.config.ts`
  - Depends on: none

- [x] T-017 (fixes F-014) Require auth for `/api/locales`
  - File(s): `src/app/api/locales/route.ts`
  - Change: call `requireAuth()`; return 401 when unauthenticated
  - Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/locales`
  - Expected output: `401`; login page still renders (uses `languageContext` fallback list)
  - Rollback: `git checkout -- src/app/api/locales/route.ts`
  - Depends on: none

- [x] T-018 (fixes F-020) Private attachment storage
  - File(s): `src/app/api/shared/storageShared.ts` (new), `src/app/api/tasks/[id]/image/route.ts`,
    `src/app/api/images/[...path]/route.ts`, `src/app/api/tasks/[id]/route.ts`,
    `src/components/common/tasksCommon.tsx`, `.gitignore`
  - Change: store uploads in `uploads/` (outside `public/`, git-ignored); serve via the auth-gated
    `/images` rewrite; mark attachment images `unoptimized`
  - Verify: unauth `GET /images/<path>` → `401`; authed → `200 image/webp`; image renders in the task dialog
  - Expected output: as above
  - Rollback: `git checkout -- src/app/api .gitignore src/components/common/tasksCommon.tsx && rm src/app/api/shared/storageShared.ts`
  - Depends on: none

- [x] T-019 (fixes F-002) Upgrade `sharp` to `^0.35.5`
  - Verify: `npm audit` (sharp clear); `npm run build`; sharp smoke test
  - Rollback: `git checkout -- package.json package-lock.json && npm install`
  - Depends on: T-014

- [x] T-020 (fixes F-005) Upgrade `uuid` to `^11.1.1`, drop `@types/uuid`
  - Verify: `npm run type-check`; uuid-v4 e2e via project creation
  - Rollback: `git checkout -- package.json package-lock.json && npm install`
  - Depends on: T-014

- [x] T-021 (fixes F-001) Upgrade `jspdf` to `^4.2.1`
  - Verify: `npm audit` (jspdf clear); browser PDF export produced a valid 2-page PDF, no console errors
  - Rollback: `git checkout -- package.json package-lock.json && npm install`
  - Depends on: T-014

- [x] T-022 (fixes F-004) Upgrade `@huggingface/transformers` to `^4.3.1` + `sprintf-js` override
  - Verify: identical translation output; `/api/translate` e2e
  - Rollback: `git checkout -- package.json package-lock.json && npm install`
  - Depends on: T-014

- [ ] T-023 (fixes F-003) Migrate Tailwind CSS 3 → 4 to drop the `braces` chain — **DEFERRED**
  - File(s): `package.json`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`
  - Change: migrate styling to Tailwind 4 and update `@next/eslint-plugin-next`
  - Verify: full visual regression + `npm run build`
  - Expected output: `npm audit` → 0 vulnerabilities
  - Rollback: `git checkout -- package.json package-lock.json tailwind.config.ts postcss.config.mjs src/app/globals.css && npm install`
  - Depends on: dedicated user-approved effort
  - Reason for deferral: `braces` has **no patched version** (`CVE-2026-93687`); the chain is
    **dev/build-time only**; the only fix is a large, risky Tailwind major migration. Not improvised.
