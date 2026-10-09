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

## Decisions that could not be made alone (blocking Phase 4+)

1. Dependency upgrades F-001…F-005 (breaking) — upgrade now, or defer?
2. CSP F-007 — add a real CSP header, or docs-only correction?
3. Leader task visibility F-009 — change behavior, or keep?
4. Gate `/api/locales` F-014 — add auth (may break login-page i18n), or keep public?
5. Leader own-password check F-013 — enforce, or keep?
6. `scripts/*.sh` comments — strip per Phase 6, or keep per repo policy?
7. `SESSION_SECRET` length F-012 — enforce in code, or docs-only?
8. F-020 attachment image auth — needs a manual UI test first.
9. No test suite exists — out of scope.

## Phase 4 — Execution

- Not started. Waiting for CHECKPOINT approval.

## Phase 5 — Deletions

- None. No file met the High-confidence unused bar; nothing deleted.

## Phase 6 — Code comments

- None removed. `src/**` already comment-free.

## Phase 7 — Config comments

- None changed. Config files already use the required style.

## Phase 8 — Final verification

- Not started.
