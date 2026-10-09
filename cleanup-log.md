# TaskBoard — Cleanup Log

Append-only log of every file deleted, code block removed, comment change, and every decision that
could not be made alone. Newest entries at the bottom.

- Branch: `audit-cleanup` · Tag: `pre-audit` · Base commit: `ef7781d9`

---

## Phase 0 — Safety net (2026-10-09)

- `pwd` → `/home/shadow-x7/Projects/Websites/Typescript/Next.js/TaskBoard`
- `git status` → working tree clean before start.
- Created branch `audit-cleanup` (`git checkout -b audit-cleanup`).
- Created tag `pre-audit` with `git -c tag.gpgsign=false tag pre-audit`
  (repo has `tag.gpgsign true` but no signing key available; used an inline override so no global
  git config was changed).
- Baseline recorded in `audit-report.md` → "Baseline". All baseline commands green:
  `npm install` (exit 0), `npm run lint` (0), `npm run type-check` (0), `npm run format:check` (0),
  `npm run build` (0), `npm run check:comments` (policy holds), `npm run check:versions` (4.1.0),
  `npm run dev` (served `/`, `/login`, `/api/auth/me`, `/api/locales`).
- No file was modified, deleted, or had comments changed in Phase 0.

## Phases 1–2 — Inventory and audit (read-only)

- No changes. Only reads and read-only commands were run.
- Findings F-001 … F-022 recorded in `audit-report.md`.
- Comment inventory recorded in `audit-report.md`.

## Phase 3 — Plan (read-only)

- Wrote `audit-report.md` and `fix-plan.md`.
- No changes.

## Decisions (resolved by explicit user approval, 2026-10-09)

The user granted explicit approval to complete everything without further check-ins. Resolutions:

1. Dependency upgrades F-001…F-005 → **DEFERRED** (all breaking; rule forbids auto-upgrade).
2. CSP F-007 → **docs-only** correction (no CSP header added).
3. Leader task visibility F-009 → **fixed** (leaders see all project tasks).
4. `/api/locales` F-014 → **left public** (gating would break login-page i18n).
5. Leader own-password F-013 → **fixed** (current password required on self change).
6. `scripts/*.sh` comments → **removed** (non-banner), per Phase 6.
7. `SESSION_SECRET` length F-012 → **no change** (README did not over-promise; evidence corrected).
8. F-020 attachment images → **no change** (needs manual browser test).
9. No test suite → out of scope.

## Phase 4 — Execution (2026-10-09)

Every task: one change, then verify, then continue. All verifications passed first try; no task
needed a revert.

### Group 1 — Security

- **T-001 (F-006)** — `src/app/api/shared/rateLimitShared.ts`: moved the `x-real-ip` read inside
  the `TRUST_PROXY === "true"` guard. Commit `eb7d47ac`.
  Verify: `npm run lint` = 0, `npm run type-check` = 0.

### Group 2 — Bugs

- **T-002 (F-010)** — `src/app/api/shared/databaseShared.ts`: `readJSON` rethrows `SyntaxError`
  immediately instead of retrying.
- **T-003 (F-011)** — `src/app/api/shared/databaseShared.ts`: `deleteSection` now captures the
  removed section and recomputes/persists the project `endDate`.
- **T-004 (F-016)** — `src/components/pages/projectsPage.tsx`: sort a copy (`[...displayedProjects]`)
  instead of mutating the Zustand array.
  Commit `97f8ca70`. Verify: `npm run lint` = 0, `npm run type-check` = 0.

### Group 3 — Config / docs

- **T-005 (F-022)** — `package.json`: `"private": false` → `true`. Verify:
  `node -e "...private===true"` exit 0. Commit `ed96c605`.
- **T-006 (F-012)** — **CANCELLED.** On verification, the README did not contain the quoted
  "32 characters" claim (it exists only in a git-ignored `.kilo/plans/` file). F-012 corrected in
  `audit-report.md` to a hardening suggestion. No file changed.
- **T-007 (F-007)** — `README.md` + `README_AR.md`: security-headers bullet now lists the headers
  actually set (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`) instead of the nonexistent `CSP`.
- **T-008 (F-017)** — `README.md` + `README_AR.md`: added the `4.1.0` changelog-table row.
  Markdown reflowed with Prettier to keep `format:check` green. Commit `a8b63d40`.
  Verify: `npm run check:versions` = 0, `npm run format:check` = 0.

### Group 4 — Dead code

- **T-009 (F-008)** — `src/app/error.tsx`: removed the empty `useEffect` block and the now-unused
  `useEffect` import.
- **T-010 (F-015)** — `src/components/pages/membersPage.tsx`: removed the unused `isActive` prop
  from `SortableMemberCard` and its call site.
- **T-011 (F-021)** — `src/components/common/sortableCommon.tsx`: `import { Task, User }` →
  `import type { Task, User }`.
  Commit `0d4c8095`. Verify: `npm run lint` = 0, `npm run type-check` = 0.

### Bug fixes decided under approval

- **F-009** — `src/app/api/tasks/route.ts`: removed the leader-only `assignedTo` filter in the
  `projectId` branch (members still filtered).
- **F-013** — `src/app/api/users/[id]/route.ts`: current-password check now keys off
  `currentUser.id === id` (self change) rather than `role !== "leader"`.
  Commit `ef0b3991`. Verify: `npm run lint` = 0, `npm run type-check` = 0.

### Group 6 — Shell script comments

- **T-012** — removed non-banner comments from `scripts/check-comments.sh`,
  `scripts/check-versions.sh`, `scripts/set-version.sh`. Kept shebang (line 1) and the
  credit/attribution banner (lines 2-5). No `#` inside strings/awk touched. Commit `b3fc9d5b`.
  Verify: `bash -n` on all three = OK; `npm run check:comments` = "comment policy holds";
  `npm run check:versions` = 0.

## Phase 5 — Deletions

- **None.** No file met the High-confidence unused bar. Every `src/**` file is imported or is a
  Next.js convention file; `src/proxy.ts` is the Next 16 proxy (build shows `ƒ Proxy (Middleware)`).
  No `*.bak/*.old/*.orig/*.tmp/*.log` found. All dependencies referenced. Nothing deleted.

## Phase 6 — Code comments

- `src/**` and `scripts/download-models.mjs` were already comment-free (policy guard passes).
- Removed non-banner comments from the three `scripts/*.sh` files (T-012, above).
- Kept: shebang lines; credit/attribution banners at the top of the three shell scripts;
  `/*! ... */` third-party license banner in `public/css/font-awesome.min.css`; and `#` characters
  that are string/awk content. Remaining comment scan (below) shows only those kept items.

## Phase 7 — Config comments

- **No change needed.** `.env.example`, `.env.local`, `.gitignore`, `.gitattributes`,
  `.editorconfig`, `.github/workflows/ci.yml`, `.github/ISSUE_TEMPLATE/config.yml`, and
  `.github/FUNDING.yml` already use the required `─` header + `# ── Section ──` style. Strict JSON
  files correctly have no comments. `.env.local` value was never read into logs or modified.

## Phase 8 — Final verification

- Full baseline re-run on `audit-cleanup` HEAD:
  - `npm run lint` = 0
  - `npm run type-check` = 0
  - `npm run format:check` = "All matched files use Prettier code style!"
  - `npm run check:comments` = "comment policy holds"
  - `npm run check:versions` = "all version locations agree on 4.1.0"
  - `npm run build` = 0 (same 27 routes + `ƒ Proxy (Middleware)`; only the pre-existing React 18
    deprecation warning)
  - `npm run dev` served: `/` → 307 `/login`; `/login` → 200; `/api/auth/me` → 401;
    `/api/locales` → 200; `/api/projects` (unauth) → 401.
- Comment scan: `src/**` has zero comments; `scripts/*.sh` have only shebang + banner.
- `git status` clean. `git diff --stat pre-audit..HEAD`: 17 files, +1272 / −60. No secret added
  (no `.env*` in the diff).
- Dependency audit unchanged (17 vulnerabilities remain; all upgrades deferred by decision).

---

## Round 2 — User-directed fixes (2026-10-09)

User directive: fix vulnerabilities first, then upgrade packages; add CSP; gate `/api/locales`
without breaking login; enforce `SESSION_SECRET`; fix attachments; add automated tests.
All changes were made one at a time with verification; nothing needed a revert.

### Added

- `vitest.config.mts` (test runner config; `.mts` to avoid the Vite CJS-config warning).
- `src/utils/pricingUtils.test.ts`, `src/utils/textScriptUtil.test.ts`,
  `src/components/ui/utilsUi.test.ts`, `src/app/api/shared/validatorsShared.test.ts`,
  `src/app/api/shared/rateLimitShared.test.ts` (22 tests total).
- `src/app/api/shared/storageShared.ts` (upload directory helpers).
- `package.json`: `"test": "vitest run"`, `vitest@^4.1.11` devDependency.

### Code changed

- `src/app/api/auth/utilsAuth.ts` — enforce `SESSION_SECRET` ≥ 32 chars (F-012).
- `next.config.ts` — real `Content-Security-Policy` header (F-007).
- `src/app/api/locales/route.ts` — `requireAuth()` gate (F-014).
- `src/app/api/tasks/[id]/image/route.ts`, `src/app/api/images/[...path]/route.ts`,
  `src/app/api/tasks/[id]/route.ts` — store/serve/delete attachments under `uploads/` (F-020).
- `src/components/common/tasksCommon.tsx` — attachment `<Image>` set `unoptimized` (F-020).
- `.gitignore` — ignore `uploads/`.
- `.github/workflows/ci.yml` — run `npm test`.
- `.env.example`, `README.md`, `README_AR.md` — secret minimum, CSP claim, `npm test` row.

### Dependencies upgraded (one commit each)

- `sharp` `^0.34.5` → `^0.35.5` (F-002), commit `6527f39e`.
- `uuid` `^9.0.1` → `^11.1.1`, removed `@types/uuid` (F-005), commit `b6c129c2`.
- `jspdf` `^2.5.2` → `^4.2.1` (F-001), commit `39912ee3`.
- `@huggingface/transformers` `^3.8.1` → `^4.3.1` (F-004), commit `9f4fb966`.
- `overrides`: `postcss-selector-parser@^7.1.6`, `sprintf-js@^1.1.3` (F-003/F-004 transitive).

### End-to-end verifications run (all passed)

- Login, project/section/task creation via API.
- Image upload + render in the task dialog; unauth image request → 401.
- Browser PDF export → valid 2-page PDF, no console errors.
- `/api/translate` en→ar → same output as the pre-upgrade baseline.
- Login page renders with the new CSP (0 violations) and with `/api/locales` gated.

### Test data handling (no secrets, fully reverted)

- Temporary `databases/*.json` rows and any uploaded files were created only to exercise flows and
  were removed with `git checkout -- databases/` and `rm -rf uploads public/images/<id>`.
- `SESSION_SECRET` in `.env.local` was never read into logs and never modified.

### Not fixed (deferred, flagged to user)

- **F-003 `braces` chain** — `CVE-2026-93687` has no patched version; dev/build-time only; requires a
  Tailwind 4 migration. Left as-is with rationale (T-023).

### Result

- `npm audit`: `17` → `6` vulnerabilities (all the single unfixable dev-time `braces` chain).
- Final gates: `format:check`, `lint`, `type-check`, `test` (22 passed), `build`, `check:comments`,
  `check:versions` — all exit 0.

---

## Round 3 — F-003 re-investigation and F-018 (2026-10-09)

### F-018 — documented

- `README.md` / `README_AR.md`: added "Operational notes" covering the in-memory, per-process rate
  limiter, the `TRUST_PROXY` requirement, and private `uploads/`. Documentation only; no code change.

### F-003 — no change (migration cancelled on evidence)

- Ran an isolated probe in `/tmp/kilo/probe` installing **only** `@next/eslint-plugin-next@16.4.0`:
  `npm audit` reported **4 high** advisories, proving `braces@3.0.3` (no patch) is pulled by
  `@next/eslint-plugin-next → fast-glob@3.3.1 → micromatch@4.0.8 → braces`.
- Therefore the approved Tailwind 4 migration would **not** clear the advisory and would add
  UI-regression risk. It was **not executed**.
- No files deleted, no code removed, no dependency changed in this round.

### Not performed (deliberate)

- Tailwind CSS 3 → 4 migration (no security benefit proven; would require also removing
  `@next/eslint-plugin-next` to reach 0).
- `.env.local` `SESSION_SECRET`: never read into logs, never modified (confirmed again).
