# TaskBoard — Audit Report

- Project: **TaskBoard** (`package.json` name: `taskboard`, version `4.1.0`)
- Repository: https://github.com/red-shadows-rs/taskboard
- Audit branch: `audit-cleanup` (created from `main` @ `ef7781d9`)
- Safety tag: `pre-audit`
- Date: 2026-10-09
- Auditor: automated audit (Kilo), read-only through Phase 2

> Every claim below is backed by a command or a code snippet. Items that could not be
> executed/verified in this environment are prefixed `UNVERIFIED:`.

---

## Baseline

Recorded before any edit, on branch `audit-cleanup` at commit `ef7781d9`, tag `pre-audit`.

### Toolchain

```
$ node --version
v24.18.0
$ npm --version
12.0.2
```

### Install — `npm install`

```
$ npm install
run `npm fund` for details

17 vulnerabilities (8 moderate, 8 high, 1 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
npm warn install-scripts   core-js@3.50.0 (postinstall: node -e "try{require('./postinstall')}catch(e){}")
npm warn install-scripts   onnxruntime-node@1.21.0 (postinstall: node ./script/install)
npm warn install-scripts   protobufjs@7.6.6 (postinstall: node scripts/postinstall)
npm warn install-scripts   sharp@0.34.5 (install: node install/check.js || npm run build)
npm warn install-scripts
npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
```

Exit code `0`. Working tree remained clean afterwards.

### Build — `npm run build`

```
$ npm run build
▲ Next.js 16.4.0 (Turbopack)
- Environments: .env.local
⚠ React 18 support is deprecated in Next.js 16 and will be removed in Next.js 17. Please upgrade to React 19. Learn more: https://nextjs.org/docs/messages/react-version
✓ Running next.config.ts took 48ms

  Creating an optimized production build ...
✓ Compiled successfully in 1588ms
  Running TypeScript ...
  Finished TypeScript in 2.2s ...
  Collecting page data using 15 workers ...
  Generating static pages using 15 workers (15/15) in 329ms
  Finalizing page optimization ...

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/me
├ ƒ /api/images/[...path]
├ ƒ /api/locales
├ ƒ /api/projects
├ ƒ /api/projects/[id]
├ ƒ /api/sections
├ ƒ /api/sections/[id]
├ ƒ /api/sections/reorder
├ ƒ /api/tasks
├ ƒ /api/tasks/[id]
├ ƒ /api/tasks/[id]/image
├ ƒ /api/tasks/reorder
├ ƒ /api/translate
├ ƒ /api/users
├ ƒ /api/users/[id]
├ ƒ /api/users/reorder
├ ƒ /dashboard/analytics
├ ƒ /dashboard/projects
├ ƒ /dashboard/projects/[id]
├ ƒ /dashboard/tasks
├ ƒ /dashboard/team
├ ƒ /login
├ ƒ /profile

ƒ Proxy (Middleware)

ƒ  (Dynamic)  server-rendered on demand
```

Exit code `0`. One warning: React 18 deprecated in Next.js 16 (not caused by this audit).

### Lint — `npm run lint`

```
$ npm run lint
> eslint src scripts
```

Exit code `0`, no output (clean).

### Type check — `npm run type-check`

```
$ npm run type-check
> tsc --noEmit
```

Exit code `0`, no output (clean).

### Format check — `npm run format:check`

```
$ npm run format:check
> prettier --check "**/*.{js,jsx,ts,tsx,json,css,md}"
Checking formatting...
All matched files use Prettier code style!
```

### Policy guards

```
$ npm run check:comments
> bash scripts/check-comments.sh
comment policy holds

$ npm run check:versions
> bash scripts/check-versions.sh
check-versions: all version locations agree on 4.1.0
```

### Test command

There is **no test script** in `package.json` and no test runner in the repository.
Baseline test command: _none_. This is a gap, not a regression.

### Start — `npm run dev`

```
$ npm run dev
- Local:         http://localhost:3000
```

Live probes against the running dev server:

```
$ curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://localhost:3000/
307 -> http://localhost:3000/login

$ curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
200

$ curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/auth/me
{"error":"Unauthorized"}
HTTP 401

$ curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/locales
["auth","common","dashboard","dashboard/analytics","dashboard/projects","dashboard/tasks","dashboard/team","profile"]
HTTP 200
```

Baseline is green: install OK, lint OK, type-check OK, format OK, build OK, dev server serves
pages, auth-gated API returns 401 when unauthenticated.

### Dependency audit — `npm audit`

```
$ npm audit
jsPDF has HTML Injection in New Window paths - https://github.com/advisories/GHSA-wfv2-pwc8-crg5
fix available via `npm audit fix --force`
Will install jspdf@4.2.1, which is a breaking change
node_modules/jspdf

postcss-selector-parser  <7.1.6
Severity: moderate
PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion - https://github.com/advisories/GHSA-rj75-hqrm-r3gf
fix available via `npm audit fix --force`
Will install tailwindcss@4.3.3, which is a breaking change
node_modules/postcss-nested/node_modules/postcss-selector-parser
node_modules/postcss-selector-parser
node_modules/tailwindcss/node_modules/postcss-selector-parser
  @tailwindcss/typography  <=0.0.0-insiders.fda8ce5 || >=0.5.5
  Depends on vulnerable versions of postcss-selector-parser
  node_modules/@tailwindcss/typography
  postcss-nested  2.0.3 - 6.2.0
  Depends on vulnerable versions of postcss-selector-parser
  node_modules/postcss-nested

sharp  <=0.35.5-rc.1
Severity: high
sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 - https://github.com/advisories/GHSA-f88m-g3jw-g9cj
sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 - https://github.com/advisories/GHSA-rgj7-g3m4-5g8c
sharp : Vulnerability in librsvg dependency CVE-2026-96889 - https://github.com/advisories/GHSA-wq5f-xc86-pv6w
fix available via `npm audit fix --force`
Will install sharp@0.35.5, which is a breaking change
node_modules/sharp
  @huggingface/transformers  <=4.2.0
  Depends on vulnerable versions of onnxruntime-node
  Depends on vulnerable versions of sharp
  node_modules/@huggingface/transformers

sprintf-js  *
Severity: moderate
sprintf-js vulnerable to denial of service through unbounded precision specifiers - https://github.com/advisories/GHSA-hp3w-g68c-fv3c
fix available via `npm audit fix --force`
Will install @huggingface/transformers@4.3.1, which is a breaking change
node_modules/sprintf-js
  roarr  <=2.15.4
  Depends on vulnerable versions of sprintf-js
  node_modules/roarr
    global-agent  <=3.0.0
    Depends on vulnerable versions of roarr
    node_modules/global-agent
      onnxruntime-node  1.21.0-dev.20241112-cdc8db9984 - 1.25.0-dev.20260327-722743c0e2
      Depends on vulnerable versions of global-agent
      node_modules/onnxruntime-node

uuid  <11.1.1
Severity: moderate
uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided - https://github.com/advisories/GHSA-w5hq-g745-h8pq
fix available via `npm audit fix --force`
Will install uuid@14.0.2, which is a breaking change
node_modules/uuid

17 vulnerabilities (8 moderate, 8 high, 1 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force
```

### Secrets in git history

```
$ git log --all --oneline --name-only -- '.env' '.env.local'
(no output — no .env file has ever been tracked)

$ git log -p --all | grep -inE '^\+.*(SESSION_SECRET|password|secret|api[_-]?key|private[_-]?key|BEGIN .*PRIVATE KEY)'
# only placeholders / docs / CI dummy values, e.g.:
+  SESSION_SECRET: ci-build-session-secret-not-used-at-runtime
+| `SESSION_SECRET` | Yes | — | HMAC-SHA256 signing key |
```

No real secret was found committed. See F-019 for the local (untracked) secret.

---

## Stack detection

| Aspect                          | Detected                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Languages                       | TypeScript 5, CSS (Tailwind), Bash, Markdown                                                                        |
| Framework                       | Next.js 16 (App Router, Turbopack) — installed `next@16.4.0`                                                        |
| UI                              | React 18.3.1, Radix UI primitives, Tiptap, Recharts, Framer Motion                                                  |
| State                           | Zustand 4                                                                                                           |
| Validation                      | Zod 3 + React Hook Form                                                                                             |
| Translation                     | `@huggingface/transformers` (NLLB-200, local ONNX)                                                                  |
| Styling                         | Tailwind CSS 3, PostCSS, Autoprefixer                                                                               |
| Package manager                 | npm (`package-lock.json`, `npm ci` in CI)                                                                           |
| Entry points                    | `src/app/layout.tsx`, `src/app/page.tsx` (redirects to `/login`), `src/proxy.ts` (middleware)                       |
| Routes                          | 19 API route handlers under `src/app/api/**`, 8 page routes                                                         |
| Background jobs / cron / Docker | none                                                                                                                |
| CI                              | `.github/workflows/ci.yml` (check-comments, check-versions, format, lint, type-check, build)                        |
| Linters available               | ESLint 9 (flat config), Prettier 3, `tsc --noEmit`, custom `scripts/check-comments.sh`, `scripts/check-versions.sh` |
| Test runner                     | none                                                                                                                |

No new global tools were installed. All analysis used tools already present in the project.

---

## Inventory (read-only)

Legend: `refs` = files that import/reference the path (Next.js convention files are referenced
by the framework, not by an import).

### Root / config

| Path                                              | Purpose                            | Lang | Size        | refs                                                          |
| ------------------------------------------------- | ---------------------------------- | ---- | ----------- | ------------------------------------------------------------- |
| `package.json`                                    | Manifest, scripts, deps            | JSON | 2914        | npm                                                           |
| `package-lock.json`                               | Lockfile                           | JSON | 227693      | npm                                                           |
| `next.config.ts`                                  | Headers, rewrites, external pkgs   | TS   | 929         | Next                                                          |
| `tsconfig.json`                                   | TS config                          | JSON | 670         | tsc/Next                                                      |
| `tailwind.config.ts`                              | Tailwind theme                     | TS   | 3978        | PostCSS                                                       |
| `postcss.config.mjs`                              | PostCSS plugins                    | MJS  | 105         | Next                                                          |
| `eslint.config.mjs`                               | ESLint flat config                 | MJS  | 1190        | eslint                                                        |
| `.prettierrc`                                     | Prettier config                    | JSON | 180         | prettier                                                      |
| `translation.config.json`                         | Model id/dtype/flores              | JSON | 154         | `src/lib/translationConfig.ts`, `scripts/download-models.mjs` |
| `.env.example`                                    | Env template                       | env  | 1088        | docs                                                          |
| `.env.local`                                      | Local env (git-ignored)            | env  | 520         | Next runtime                                                  |
| `.gitignore` / `.gitattributes` / `.editorconfig` | Repo hygiene                       | conf | 917/426/670 | git/editors                                                   |
| `next-env.d.ts`                                   | Next TS shim (git-ignored)         | TS   | 296         | tsc                                                           |
| `tsconfig.tsbuildinfo`                            | TS incremental cache (git-ignored) | JSON | 270829      | tsc                                                           |

### Scripts

| Path                          | Purpose                    | Lang | Size | refs               |
| ----------------------------- | -------------------------- | ---- | ---- | ------------------ |
| `scripts/check-comments.sh`   | Enforce no-comments policy | Bash | 2167 | `package.json`, CI |
| `scripts/check-versions.sh`   | Version consistency        | Bash | 1739 | `package.json`, CI |
| `scripts/set-version.sh`      | Bump version everywhere    | Bash | 2078 | `package.json`     |
| `scripts/download-models.mjs` | Download ONNX model        | MJS  | 1718 | `package.json`     |

### `src/app` (routes/pages)

| Path                                       | Purpose                     | Lang | Size | refs         |
| ------------------------------------------ | --------------------------- | ---- | ---- | ------------ |
| `src/app/layout.tsx`                       | Root layout, providers      | TSX  | 2492 | Next         |
| `src/app/page.tsx`                         | `/` → `/login`              | TSX  | 102  | Next         |
| `src/app/error.tsx`                        | Error boundary UI           | TSX  | 2890 | Next         |
| `src/app/not-found.tsx`                    | 404 UI                      | TSX  | 2333 | Next         |
| `src/app/globals.css`                      | Tailwind base + theme vars  | CSS  | 3954 | `layout.tsx` |
| `src/app/login/page.tsx`                   | Login form                  | TSX  | 7573 | Next         |
| `src/app/dashboard/layout.tsx`             | Dashboard shell (auth gate) | TSX  | 554  | Next         |
| `src/app/dashboard/loading.tsx`            | Loading UI                  | TSX  | 142  | Next         |
| `src/app/dashboard/tasks/page.tsx`         | Tasks board page            | TSX  | 477  | Next         |
| `src/app/dashboard/tasks/loading.tsx`      | Loading UI                  | TSX  | 138  | Next         |
| `src/app/dashboard/projects/page.tsx`      | Projects list page          | TSX  | 467  | Next         |
| `src/app/dashboard/projects/loading.tsx`   | Loading UI                  | TSX  | 141  | Next         |
| `src/app/dashboard/projects/[id]/page.tsx` | Project detail page         | TSX  | 489  | Next         |
| `src/app/dashboard/analytics/page.tsx`     | Analytics page              | TSX  | 442  | Next         |
| `src/app/dashboard/analytics/loading.tsx`  | Loading UI                  | TSX  | 142  | Next         |
| `src/app/dashboard/team/page.tsx`          | Team page                   | TSX  | 364  | Next         |
| `src/app/dashboard/team/loading.tsx`       | Loading UI                  | TSX  | 137  | Next         |
| `src/app/profile/layout.tsx`               | Profile shell               | TSX  | 552  | Next         |
| `src/app/profile/page.tsx`                 | Profile page                | TSX  | 362  | Next         |
| `src/app/profile/loading.tsx`              | Loading UI                  | TSX  | 140  | Next         |

### `src/app/api` (route handlers)

| Path                                                                                                   | Purpose                     | Lang | Size                | refs                     |
| ------------------------------------------------------------------------------------------------------ | --------------------------- | ---- | ------------------- | ------------------------ |
| `.../api/auth/login/route.ts`                                                                          | POST login + session cookie | TS   | 1900                | client                   |
| `.../api/auth/logout/route.ts`                                                                         | POST logout                 | TS   | 512                 | client                   |
| `.../api/auth/me/route.ts`                                                                             | GET current user            | TS   | 624                 | client                   |
| `.../api/auth/utilsAuth.ts`                                                                            | Session/HMAC/bcrypt helpers | TS   | 3191                | all auth routes, layouts |
| `.../api/shared/databaseShared.ts`                                                                     | JSON-file data layer        | TS   | 9728                | routes                   |
| `.../api/shared/accessShared.ts`                                                                       | Authorization helpers       | TS   | 1331                | routes                   |
| `.../api/shared/rateLimitShared.ts`                                                                    | In-memory rate limiter      | TS   | 1488                | routes                   |
| `.../api/shared/validatorsShared.ts`                                                                   | Zod schemas                 | TS   | 3513                | routes, forms            |
| `.../api/projects/route.ts`, `projects/[id]/route.ts`                                                  | Project CRUD                | TS   | 2800/3575           | client                   |
| `.../api/sections/route.ts`, `sections/[id]/route.ts`, `sections/reorder/route.ts`                     | Section CRUD/reorder        | TS   | 3225/3595/1525      | client                   |
| `.../api/tasks/route.ts`, `tasks/[id]/route.ts`, `tasks/reorder/route.ts`, `tasks/[id]/image/route.ts` | Task CRUD/reorder/upload    | TS   | 5352/6123/1708/4567 | client                   |
| `.../api/users/route.ts`, `users/[id]/route.ts`, `users/reorder/route.ts`                              | User CRUD/reorder           | TS   | 2523/4204/1164      | client                   |
| `.../api/images/[...path]/route.ts`                                                                    | Authenticated image serving | TS   | 1816                | `<img>`/Next Image       |
| `.../api/locales/route.ts`                                                                             | List locale dirs            | TS   | 1264                | `languageContext`        |
| `.../api/translate/route.ts`                                                                           | Local translation endpoint  | TS   | 2644                | `translateFormUtil`      |

### `src/components`

| Path                           | Purpose                   | Lang | Size     | refs                               |
| ------------------------------ | ------------------------- | ---- | -------- | ---------------------------------- |
| `common/chartsCommon.tsx`      | Stats + Recharts + tables | TSX  | 65890    | dashboard, analytics               |
| `common/dashboardCommon.tsx`   | Task/section dashboard    | TSX  | 16466    | `dashboard/tasks/page`             |
| `common/kanbanCommon.tsx`      | Kanban DnD board          | TSX  | 14958    | dashboardCommon                    |
| `common/loadingCommon.tsx`     | Loading spinner           | TSX  | 930      | many                               |
| `common/metadataCommon.tsx`    | Dynamic title/meta        | TSX  | 1426     | `layout.tsx`                       |
| `common/projectsCommon.tsx`    | Project card/form         | TSX  | 22432    | projectsPage                       |
| `common/sectionsCommon.tsx`    | Section card/form/dialog  | TSX  | 8920     | dashboardCommon, projectDetailPage |
| `common/settingsCommon.tsx`    | Theme + language toggles  | TSX  | 5565     | many                               |
| `common/sortableCommon.tsx`    | Sortable task wrapper     | TSX  | 1712     | projectSectionPage                 |
| `common/tasksCommon.tsx`       | Task card/form/dialog     | TSX  | 60693    | dashboardCommon, projectDetailPage |
| `common/titleCommon.tsx`       | Per-page title            | TSX  | 948      | many                               |
| `layouts/footerLayout.tsx`     | Footer                    | TSX  | 690      | layouts                            |
| `layouts/navbarLayout.tsx`     | Navbar + menu             | TSX  | 20320    | layouts                            |
| `pages/analyticsPage.tsx`      | Analytics page            | TSX  | 11557    | route                              |
| `pages/membersPage.tsx`        | Team management           | TSX  | 35781    | teamPage                           |
| `pages/profilePage.tsx`        | Profile form              | TSX  | 10259    | route                              |
| `pages/projectDetailPage.tsx`  | Project detail            | TSX  | 33942    | route                              |
| `pages/projectSectionPage.tsx` | Section with tasks        | TSX  | 8676     | projectDetailPage                  |
| `pages/projectsPage.tsx`       | Projects list             | TSX  | 14843    | route                              |
| `pages/teamPage.tsx`           | Team wrapper              | TSX  | 3857     | route                              |
| `ui/*.tsx` (16 files)          | shadcn-style primitives   | TSX  | 398–9409 | components                         |
| `ui/utilsUi.ts`                | `cn`, color/date helpers  | TS   | 2703     | many                               |

### `src/contexts`, `src/lib`, `src/utils`, `src/types`

| Path                           | Purpose                      | Lang | Size  | refs                           |
| ------------------------------ | ---------------------------- | ---- | ----- | ------------------------------ |
| `contexts/languageContext.tsx` | i18n provider                | TSX  | 4511  | layout + components            |
| `contexts/storeContext.tsx`    | Zustand store                | TSX  | 5439  | many                           |
| `lib/translationConfig.ts`     | Model constants              | TS   | 564   | translationServer              |
| `lib/translationServer.ts`     | Transformers.js runtime      | TS   | 4024  | translate route                |
| `proxy.ts`                     | Same-origin guard middleware | TS   | 724   | Next                           |
| `types/index.ts`               | Shared interfaces            | TS   | 2458  | many                           |
| `utils/pdfUtil.ts`             | PDF export (bilingual)       | TS   | 41748 | pages, projectSectionPage      |
| `utils/pricingUtils.ts`        | Price totals/format          | TS   | 1132  | kanban, charts, projects       |
| `utils/textScriptUtil.ts`      | Script detection/strip HTML  | TS   | 1397  | translateFormUtil, tasksCommon |
| `utils/translateFormUtil.ts`   | Build localized pairs        | TS   | 3449  | forms                          |

### Static assets / data

| Path                                                                                            | Purpose                 | Lang      | Size      | refs                              |
| ----------------------------------------------------------------------------------------------- | ----------------------- | --------- | --------- | --------------------------------- |
| `databases/*.json` (4)                                                                          | JSON-file DB (all `[]`) | JSON      | 3 each    | `databaseShared.ts`               |
| `public/locales/**` (16)                                                                        | i18n JSON               | JSON      | 243–3825  | `languageContext`, `/api/locales` |
| `public/manifest.json`                                                                          | PWA manifest            | JSON      | 448       | `layout.tsx`                      |
| `public/favicon.svg`, `apple-icon.svg`                                                          | Icons                   | SVG       | 599/596   | metadata                          |
| `public/css/font-awesome.min.css`, `public/webfonts/*`                                          | Font Awesome 6          | CSS/WOFF2 | —         | `layout.tsx`                      |
| `public/fonts/IBMPlexSansArabic-*.ttf`                                                          | PDF fonts               | TTF       | —         | `pdfUtil.ts`                      |
| `public/images/.gitkeep`                                                                        | Keep upload dir         | —         | 0         | git                               |
| `docs/TRANSLATION*.md`                                                                          | Docs                    | MD        | 2928/3772 | README                            |
| `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `LICENSE`, `README*.md` | Docs                    | MD        | —         | repo                              |

### Dependency picture (summary)

- `src/app/api/**` depends on `shared/databaseShared`, `shared/accessShared`,
  `shared/rateLimitShared`, `shared/validatorsShared`, `auth/utilsAuth`, `lib/translationServer`.
- UI pages depend on `components/**`, `contexts/**`, `utils/**`.
- Env variables read in code: `SESSION_SECRET`, `TRUST_PROXY`, `TRANSLATION_ENABLED`,
  `TRANSLATION_MODELS_DIR`, `NODE_ENV` — all present in `.env.example`. `.env.local` defines
  `SESSION_SECRET` only; the rest have code defaults. **No name mismatch.**
- Every declared dependency in `package.json` is referenced at least once in `src/` or `scripts/`
  (verified by import grep). No unused dependency detected.

---

## Findings

### F-001

- Severity: Critical
- Category: Dependency
- File: `package.json:55` (`jspdf`), lockfile `node_modules/jspdf`
- Evidence:
  ```
  jsPDF has HTML Injection in New Window paths - https://github.com/advisories/GHSA-wfv2-pwc8-crg5
  fix available via `npm audit fix --force`
  Will install jspdf@4.2.1, which is a breaking change
  ```
- Why it is a problem: A known HTML-injection advisory affects the PDF export path used by
  `src/utils/pdfUtil.ts`. Untrusted task/project text can flow into generated documents.
- Exact fix: Upgrade `jspdf` to `^4.2.1` (breaking major). Requires manual verification of
  `src/utils/pdfUtil.ts` API compatibility.
- Verification command and expected output: `npm audit` → `jspdf` advisory gone; `npm run build`
  → exit 0.
- Risk of the fix: Major-version upgrade; jsPDF v4 changed APIs. Could break all PDF exports.
- Note: Recorded only, **not** upgraded automatically.

### F-002

- Severity: High
- Category: Dependency
- File: `package.json:65` (`sharp`), used in `src/app/api/tasks/[id]/image/route.ts`
- Evidence:
  ```
  sharp  <=0.35.5-rc.1
  Severity: high
  sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591
  fix available via `npm audit fix --force`
  Will install sharp@0.35.5, which is a breaking change
  ```
- Why it is a problem: Image uploads are processed by `sharp`; inherited libvips CVEs apply to
  attacker-supplied images.
- Exact fix: Upgrade `sharp` to `^0.35.5` (breaking) and re-verify the upload route.
- Verification command and expected output: `npm audit` → sharp advisories gone; `npm run build`
  → exit 0; manual upload test.
- Risk of the fix: Native dependency; needs prebuilt binary for the target platform.

### F-003

- Severity: Medium
- Category: Dependency
- File: `package.json:43` (`@tailwindcss/typography`) and `tailwindcss` chain
- Evidence:
  ```
  postcss-selector-parser  <7.1.6
  Severity: moderate
  PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion
  Will install tailwindcss@4.3.3, which is a breaking change
  ```
- Why it is a problem: Build-time CPU-exhaustion vector; not reachable at runtime by users.
- Exact fix: Track upstream; upgrade when Tailwind 4 migration is scheduled. No immediate action.
- Verification command and expected output: `npm audit` advisory resolved after upgrade.
- Risk of the fix: Tailwind 4 is a breaking change across the whole styling layer.

### F-004

- Severity: Medium
- Category: Dependency
- File: transitive via `@huggingface/transformers` → `onnxruntime-node` → `global-agent` → `roarr` → `sprintf-js`
- Evidence:
  ```
  sprintf-js  *
  Severity: moderate
  sprintf-js vulnerable to denial of service through unbounded precision specifiers
  Will install @huggingface/transformers@4.3.1, which is a breaking change
  ```
- Why it is a problem: Transitive DoS surface in the local translation runtime.
- Exact fix: Upgrade `@huggingface/transformers` to `^4.3.1` (breaking) after verifying
  `src/lib/translationServer.ts` and `scripts/download-models.mjs`.
- Verification command and expected output: `npm audit` advisory gone; `npm run models:download`
  and `/api/translate` still work.
- Risk of the fix: Transformers.js major version may change pipeline options.

### F-005

- Severity: Medium
- Category: Dependency
- File: `package.json:67` (`uuid`), used in project/section/task/user/image routes
- Evidence:
  ```
  uuid  <11.1.1
  Severity: moderate
  uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided
  Will install uuid@14.0.2, which is a breaking change
  ```
- Why it is a problem: Advisory affects v3/v5/v6 with a caller-provided buffer; the codebase only
  uses `v4` with no buffer, so practical exposure is low.
- Exact fix: Upgrade `uuid` to `^11.1.1` (or later) and keep using `v4`.
- Verification command and expected output: `npm audit` advisory gone; `npm run type-check` exit 0.
- Risk of the fix: ESM-only in newer majors; verify `@types/uuid` alignment.

### F-006

- Severity: Medium
- Category: Security
- File: `src/app/api/shared/rateLimitShared.ts:10-21`
- Evidence:
  ```ts
  function getClientIp(request: NextRequest): string {
    if (process.env.TRUST_PROXY === "true") {
      const forwarded = request.headers.get("x-forwarded-for");
      const first = forwarded?.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return "unknown";
  }
  ```
- Why it is a problem: When `TRUST_PROXY` is not `true`, the code still trusts the client-supplied
  `X-Real-IP` header. A direct client can send a different `X-Real-IP` on every request and bypass
  per-IP rate limits on login/upload/translate.
- Exact fix: Only read `x-real-ip` when `TRUST_PROXY === "true"`; otherwise return a constant
  (e.g. `"unknown"` or the connection address). One small conditional change.
- Verification command and expected output: `npm run lint` exit 0; manual test showing the login
  limiter triggers without a proxy header.
- Risk of the fix: Changes rate-limit behavior for deployments that rely on `x-real-ip` without
  setting `TRUST_PROXY`. Must be documented in `.env.example` (already says to set `TRUST_PROXY`).

### F-007

- Severity: Medium
- Category: Security / Config
- File: `next.config.ts:14-39`
- Evidence: headers block defines only `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`. No `Content-Security-Policy`. But `README.md:97`
  claims "Security Headers — X-Frame-Options, CSP, Referrer-Policy".
- Why it is a problem: The advertised CSP does not exist; defense-in-depth for XSS is weaker than
  documented.
- Exact fix (choose one): add a `Content-Security-Policy` header in `next.config.ts`, **or** correct
  the README claim. Adding CSP can break inline styles/scripts used by Radix/Tailwind.
- Verification command and expected output: `npm run build` exit 0 and manual page load with no CSP
  violations.
- Risk of the fix: A wrong CSP can break the entire UI. Needs a decision (see Needs user decision).

### F-008

- Severity: Low
- Category: Dead code / Quality
- File: `src/app/error.tsx:32-35`
- Evidence:
  ```tsx
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && error) {
    }
  }, [error]);
  ```
- Why it is a problem: Empty effect body; `useEffect` import (`error.tsx:4`) exists only for this
  dead block. No behavior.
- Exact fix: Delete the `useEffect` block and the now-unused `useEffect` import.
- Verification command and expected output: `npm run lint` exit 0 (no unused import);
  `npm run type-check` exit 0.
- Risk of the fix: None (no behavior). `error.message` is still used at `error.tsx:70`.

### F-009

- Severity: Medium
- Category: Bug
- File: `src/app/api/tasks/route.ts:88-100`
- Evidence:
  ```ts
  const allTasks = await getTasks();
  const projectSections = await getSectionsByProjectId(body.projectId);
  const sectionIds = projectSections.map((s) => s.id);
  let tasks = allTasks.filter((t) => sectionIds.includes(t.sectionId));
  if (user.role === "member") {
    tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
  } else if (user.role === "leader") {
    tasks = tasks.filter((task) => task.assignedTo.includes(user.id));
  }
  return NextResponse.json({ tasks });
  ```
  This POST-as-query is called by `src/components/pages/projectDetailPage.tsx:181-195`
  (`fetchTasks`) to populate the project detail page.
- Why it is a problem: A leader opening a project detail page receives **only tasks assigned to
  themselves**, so section task lists/counts are incomplete. `UNVERIFIED:` whether this filtering is
  intentional; the frontend expects the full project task set.
- Exact fix: In the `body.projectId` branch, do not filter leaders to `assignedTo` (keep filtering
  for `member` only), matching the intent of a project view.
- Verification command and expected output: `npm run build` exit 0; manual: log in as a leader,
  open a project containing tasks assigned to others, confirm all tasks appear.
- Risk of the fix: Changes visible data scope for leaders. Needs confirmation (see Needs user
  decision).

### F-010

- Severity: Low
- Category: Quality
- File: `src/app/api/shared/databaseShared.ts:41-57`
- Evidence:
  ```ts
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === "ENOENT") return [];
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return readJSON<T>(filename, retries - 1);
    }
    throw error;
  }
  ```
- Why it is a problem: A JSON syntax error (corrupt DB file) is retried 3 times with 100 ms delays
  before throwing, masking the real cause and adding latency.
- Exact fix: Only retry transient I/O errors; for `SyntaxError` throw immediately. Small change.
- Verification command and expected output: `npm run type-check` exit 0.
- Risk of the fix: Low; touches the shared data layer used by all routes.

### F-011

- Severity: Low
- Category: Bug
- File: `src/app/api/shared/databaseShared.ts:115-130` (`deleteSection`)
- Evidence: `deleteSection` removes the section and its tasks but never recalculates the project
  `endDate`, unlike `createSection` (`databaseShared.ts:78-92`) which calls
  `calculateProjectEndDate`.
- Why it is a problem: Deleting the task that defined a project's end date leaves a stale
  `endDate`.
- Exact fix: After deleting tasks, recompute `calculateProjectEndDate` and `updateProject`.
- Verification command and expected output: `npm run build` exit 0; manual: delete the latest-due
  task and confirm project `endDate` updates.
- Risk of the fix: Behavior change in project metadata; low risk.

### F-012

- Severity: Low
- Category: Quality
- File: `src/app/api/auth/utilsAuth.ts:10-16`; `.env.example:14`
- Evidence:
  ```ts
  const SESSION_SECRET = process.env.SESSION_SECRET as string;
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required...");
  }
  ```
  `.env.example:14` says only "Use a long random value." The code checks **presence only**, not
  strength. (Correction: an earlier draft quoted an "at least 32 characters" claim from the README;
  that text does **not** exist in the current `README.md`/`README_AR.md` — it appears only in a
  git-ignored `.kilo/plans/` file. The docs are accurate, not misleading.)
- Why it is a problem: A short/weak `SESSION_SECRET` passes the startup check, weakening session
  signing. This is a hardening suggestion, not a doc mismatch.
- Exact fix: Optionally enforce a minimum length in `utilsAuth.ts`. Deferred (could block startup
  for an existing short secret); `.env.example` already recommends a long random value.
- Verification command and expected output: `npm run build` exit 0.
- Risk of the fix: Enforcing length could reject an existing short secret and block startup.

### F-013

- Severity: Low
- Category: Security
- File: `src/app/api/users/[id]/route.ts:83-98`
- Evidence: `if (currentUser.role !== "leader") { if (!currentPassword) ... verify ... }` — leaders
  skip the current-password check when changing a password, including their own.
- Why it is a problem: A hijacked leader session can change the leader password without knowing the
  old one.
- Exact fix: Require `currentPassword` when a leader changes **their own** password.
- Verification command and expected output: `npm run build` exit 0; manual API test.
- Risk of the fix: Behavior change for the profile page (`profilePage.tsx` already sends
  `currentPassword`).

### F-014

- Severity: Low
- Category: Security
- File: `src/app/api/locales/route.ts:38-47`
- Evidence:
  ```ts
  export async function GET() {
    const paths = getLocaleDirectories(LOCALES_DIR);
    return NextResponse.json(paths);
  }
  ```
  Live probe: `GET /api/locales` → `200` without authentication.
- Why it is a problem: Unauthenticated directory listing of locale folders (information
  disclosure). Low sensitivity (locale names only).
- Exact fix: Add `await requireAuth()` (or leave as-is and accept the exposure).
- Verification command and expected output: `curl -s -o /dev/null -w "%{http_code}" /api/locales`
  → `401` when unauthenticated.
- Risk of the fix: `languageContext` loads locales before login on the login page; gating this
  route could break login-page translations. Needs verification (see Needs user decision).

### F-015

- Severity: Low
- Category: Dead code
- File: `src/components/pages/membersPage.tsx:126-141`, called at `membersPage.tsx:796`
- Evidence: `SortableMemberCard` receives `isActive={activeId === user.id}` but the component
  signature has `isActive?: boolean` and never reads it.
- Why it is a problem: Dead prop; harmless but noise.
- Exact fix: Remove the unused `isActive` prop from the type and the call site.
- Verification command and expected output: `npm run lint` exit 0.
- Risk of the fix: None.

### F-016

- Severity: Low
- Category: Bug / Quality
- File: `src/components/pages/projectsPage.tsx:323-332`
- Evidence:
  ```ts
  const displayedProjects =
    searchTerm || (statusFilter && statusFilter !== "all")
      ? filteredProjects
      : projects;
  const isDragEnabled = isDesktop && !searchTerm && statusFilter === "all";
  if (isDragEnabled) {
    displayedProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  ```
  When no filter is active, `displayedProjects` is the same reference as the Zustand `projects`
  array, and `.sort()` mutates it in place.
- Why it is a problem: Mutating Zustand state without `set()` is an anti-pattern and can cause
  subtle re-render inconsistencies.
- Exact fix: Sort a copy: `[...displayedProjects].sort(...)`.
- Verification command and expected output: `npm run lint` exit 0; manual drag reorder still works.
- Risk of the fix: None.

### F-017

- Severity: Low
- Category: Quality
- File: `README.md:268-279` (version table)
- Evidence: Highest row in the changelog table is `4.0.6`, while `package.json`/badge/CHANGELOG are
  `4.1.0` (and `check-versions.sh` passes because it does not check this table).
- Why it is a problem: Stale documentation.
- Exact fix: Add the `4.1.0` row (and `4.1.1` if present) to the README table(s).
- Verification command and expected output: manual diff review.
- Risk of the fix: None (docs only). Docs are otherwise not to be deleted.

### F-018

- Severity: Low
- Category: Quality
- File: `src/app/api/shared/rateLimitShared.ts:23-30`
- Evidence: `cleanup()` only runs when `store.size >= 10000`; the limiter is an in-memory `Map`
  and is not shared across instances or restarts.
- Why it is a problem: Rate limits reset on restart and are per-process. Acceptable for a
  single-instance self-hosted app; not a defect per se.
- Exact fix: Document the limitation, or move to a shared store if multi-instance is expected.
- Verification command and expected output: n/a.
- Risk of the fix: Out of scope; recorded for awareness.

### F-019

- Severity: Informational
- Category: Security
- File: `.env.local:8`
- Evidence: `.env.local` contains a real `SESSION_SECRET` value (value intentionally **not**
  recorded). `git ls-files` shows it is not tracked; `.gitignore:20-22` ignores `.env.local`; no
  `.env` file appears in git history.
- Why it is a problem: None currently — the secret is correctly untracked. Recorded so the value is
  never copied into reports or commits.
- Exact fix: None. **Never modify the value in this file.**
- Verification command and expected output: `git check-ignore .env.local` → `.env.local`.
- Risk of the fix: n/a.

### F-020

- Severity: Low
- Category: Bug
- File: `src/components/common/tasksCommon.tsx:209-227` (attachments via Next Image)
- Evidence: attachments render `<NextImage src={`/${path}`} .../>` where `path` is
  `images/<projectId>/<sectionId>/<file>`, and `next.config.ts:6-13` rewrites `/images/*` to the
  auth-gated `/api/images/*` route (`src/app/api/images/[...path]/route.ts:12` calls
  `requireAuth()`).
- Why it is a problem: `UNVERIFIED:` Next.js image optimization fetches the internal URL
  server-side; if it does not forward the browser session cookie, optimized attachment images may
  return 401 and not display.
- Exact fix: If confirmed, mark these images `unoptimized` or serve them through an
  authenticated client fetch.
- Verification command and expected output: manual: upload an image and confirm it renders in the
  task dialog.
- Risk of the fix: Changes image loading strategy; needs verification first.

### F-021

- Severity: Low
- Category: Quality
- File: `src/components/common/sortableCommon.tsx:4`
- Evidence: `import { Task, User } from "@/types";` imports types without the `type` keyword, unlike
  the rest of the codebase (`import type { ... }`).
- Why it is a problem: Inconsistent style; with `isolatedModules` it relies on TS elision.
- Exact fix: Change to `import type { Task, User } from "@/types";`.
- Verification command and expected output: `npm run type-check` exit 0.
- Risk of the fix: None.

### F-022

- Severity: Low
- Category: Config
- File: `package.json:4`
- Evidence: `"private": false` for a self-hosted web application with a local JSON database.
- Why it is a problem: Signals the package is publishable to npm, which it is not intended to be.
- Exact fix: Set `"private": true` (also silences accidental `npm publish`).
- Verification command and expected output: `npm run build` exit 0.
- Risk of the fix: None.

---

## Comment inventory (read-only)

### (a) Code files

| File                                                                              | Comment syntaxes present                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/**/*.ts`, `src/**/*.tsx`                                                     | **None** — enforced by `scripts/check-comments.sh` ("comment policy holds") |
| `src/app/globals.css`                                                             | None                                                                        |
| `scripts/*.sh`                                                                    | `#` (shebang + credit banner + descriptive comments)                        |
| `scripts/download-models.mjs`                                                     | None                                                                        |
| `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` | None                                                                        |
| `public/css/font-awesome.min.css`                                                 | `/*! ... */` license banner (third-party)                                   |

### (b) Config / env-style files

| File                                                                                   | Comment syntaxes present                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------ |
| `.env.example`, `.env.local`                                                           | `#` (header + section comments)            |
| `.gitignore`, `.gitattributes`, `.editorconfig`                                        | `#` (header + section comments)            |
| `.github/workflows/ci.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/FUNDING.yml` | `#` (header + section comments)            |
| `translation.config.json`, `public/manifest.json`, `.prettierrc`, `tsconfig.json`      | None (strict JSON, comments not allowed)   |
| `.github/ISSUE_TEMPLATE/*.md`, `.github/PULL_REQUEST_TEMPLATE.md`                      | Markdown (HTML comments in some templates) |

### (c) Files whose first lines are credit/attribution/license headers

`.env.example`, `.env.local`, `.gitignore`, `.gitattributes`, `.editorconfig`,
`.github/workflows/ci.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/FUNDING.yml`,
`scripts/check-comments.sh`, `scripts/check-versions.sh`, `scripts/set-version.sh`,
`public/css/font-awesome.min.css`.

### Phase 6/7 relevance

- Phase 6 (remove comments from code) is **already satisfied** for `src/**` and
  `scripts/download-models.mjs` by the repository's own policy. The only remaining "code" comments
  are inside `scripts/*.sh` (a category the repo's own `check-comments.sh` explicitly exempts — see
  Needs user decision).
- Phase 7 (config/env comment style) is **already satisfied**: `.env.example`, `.env.local`,
  `.gitignore`, `.editorconfig`, `.gitattributes`, `.github/*` already use the required
  `─` header + `# ── Section ──` style.

---

## Needs user decision

1. **Dependency upgrades (F-001…F-005).** All are breaking major upgrades. Recommend a separate,
   dedicated upgrade task with full PDF/upload/translation regression testing. Not done in this
   audit.
2. **CSP (F-007).** Add a real `Content-Security-Policy` header, or correct the README claim?
   Adding CSP risks breaking Radix/Tailwind inline styles.
3. **Leader task visibility (F-009).** Confirm whether a leader should see **all** tasks of a
   project on the project detail page, or only their own. This changes visible behavior.
4. **Gate `/api/locales` (F-014).** Adding auth could break login-page translations (which load
   before a session exists). Confirm.
5. **Leader own-password check (F-013).** Confirm enforcing `currentPassword` for leaders.
6. **`scripts/*.sh` comments (Phase 6 vs repo policy).** The user's Phase 6 says shell scripts get
   no comments, but `scripts/check-comments.sh:11` documents that `.sh` files "keep their comments
   and are out of scope". Confirm whether to strip non-banner comments from the three shell scripts.
7. **`SESSION_SECRET` length (F-012).** Enforce minimum length (could block startup) or soften docs?
8. **F-020 (attachment images through Next Image + auth).** Needs a manual UI test before any fix.
9. **No test suite.** There is no automated test command; all verification is lint/type-check/build
   plus manual checks. Consider adding tests (out of current scope).
