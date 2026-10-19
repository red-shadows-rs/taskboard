# Changelog

All notable changes to Taskboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v4.2.3] - 2026-10-20

### Changed

- **Comprehensive Documentation Suite Realignment**: Aligned all technical guides in `docs/` (`API_SPEC`, `ARCHITECTURE`, `DEPLOYMENT`, `TROUBLESHOOTING` in English and Arabic) with the Orbiscreen design language and standardized 4-line boxed header banners.
- **Community & Governance Overhaul**: Updated `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md` with strict zero-inline-comment policy rules, contributor standards, and vulnerability disclosure SLAs.
- **README Suite Redesign**: Enhanced `README.md` and `README_AR.md` with centered badges, interactive collapsible FAQ sections, stack comparison tables, and `Built by shadow-x78` attribution footer.

- Version bumped to 4.2.3 across package.json, documentation badges, and the changelog.

## [v4.2.2] - 2026-10-20

### Changed

- **Standardized Boxed File Credit Headers**: Added uniform 4-line boxed comment header followed by a single blank line across all configurations (`drizzle.config.ts`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `vitest.config.mts`, `.dockerignore`, `nginx/taskboard-proxy.conf`), and TypeScript source files (`src/app/api/...`, `src/db/...`, `src/proxy.ts`, `src/types/index.ts`) matching the Orbiscreen project specification.
- **Strict Comment Policy Compliance**: Maintained zero inline comments across all source and test files, verified through automated pre-commit policy enforcement (`scripts/check-comments.sh`).

- Version bumped to 4.2.2 across package.json, documentation badges, and the changelog.

## [v4.2.1] - 2026-10-20

### Fixed

- **Turbopack Build Dynamic Tracing**: Statically scoped legacy database archive paths (`databases/*.json`) inside `migrateLegacyJson()` in `src/db/index.ts` and scoped task attachment uploads in `src/app/api/tasks/[id]/image/route.ts` to eliminate dynamic directory tracing warnings.
- **Unused Import Removal**: Removed unused `UPLOADS_DIR` import from `@/app/api/shared/storageShared` in image route.

### Removed

- **Obsolete Migration Tooling**: Pruned `scripts/migrate-production-data.ts` and `public/images/.gitkeep` after successful remote data migration.
- **Audit Deliverables Untracked**: Removed working session reports (`audit-report.md`, `fix-plan.md`, `cleanup-log.md`, `handoff.md`) from git index.

- Version bumped to 4.2.1 across package.json, documentation badges, and the changelog.

## [v4.2.0] - 2026-10-20

### Added

- **SQLite & Drizzle ORM Storage Engine**: Full migration from unstructured JSON flat files to ACID-compliant SQLite (`data/taskboard.sqlite`) with write-ahead logging (WAL), foreign key integrity, and automated schema migrations via Drizzle ORM.
- **Automated Legacy JSON Database Migration**: Transparent one-time importer moving legacy data from `databases/*.json` into SQLite on first startup, archiving old files to `databases/archive/`.
- **Isolated Live Demo Sandbox System**: Self-contained demo environment (`/demo`) with dedicated SQLite instance (`taskboard-demo.sqlite`), zero state pollution to production, sticky demo banner with instant Reset and Exit actions, and one-click access from the login page.
- **Health Check Endpoint**: `GET /api/health` providing database connectivity status, uptime, timestamp, and version telemetry.
- **Production Docker & Nginx Orchestration**: Multi-stage lightweight `Dockerfile` based on `node:22-bookworm-slim`, production `docker-compose.yml` with persistent data volumes, and hardened Nginx reverse proxy configurations with caching and WebSocket support.
- **Enterprise Bilingual Documentation Suite**: Complete architectural and operational guides in English and Arabic (`ARCHITECTURE.md`, `DEPLOYMENT.md`, `API_SPEC.md`, `TROUBLESHOOTING.md`).

### Changed

- **Restored Dual Bilingual Inputs**: Returned explicit, dedicated Arabic and English input fields across task titles, task descriptions (rich-text editors), project titles, and section titles with independent validation.
- **Comprehensive README Overhaul**: Redesigned `README.md` and `README_AR.md` mirroring Dossier design language with interactive demo badges, Mermaid architecture diagrams, stack comparison matrices, and CLI command tables.
- **Lint Configuration**: Updated ESLint configuration to target project root uniformly (`eslint .`).

### Removed

- **Local Machine Learning Translation Stack**: Fully removed heavy `@huggingface/transformers` runtime, NLLB-200 ONNX models, background download workers, and associated translation endpoints (`/api/translate`) to reduce memory footprint and CPU overhead.

## [v4.1.2] - 2026-10-09

### Security

- Enforced a minimum length of 32 characters for `SESSION_SECRET`.
- Rate-limit client IP detection now trusts `X-Forwarded-For` / `X-Real-IP` only when `TRUST_PROXY=true`, preventing header spoofing to evade per-IP limits.
- Added a `Content-Security-Policy` response header alongside the existing security headers.
- Requires authentication for the `GET /api/locales` endpoint.
- Task attachments are now stored outside `public/` (in the git-ignored `uploads/` directory) and served only to authenticated users through the `/images/*` route.
- Changing your own password now always requires the current password, including for leaders.

### Added

- Vitest unit test suite (`npm test`) covering pricing, text-script detection, API validators, UI helpers, and rate limiting; also runs in CI.

### Changed

- Upgraded dependencies to patched releases: `sharp`, `jspdf`, `uuid`, and `@huggingface/transformers`; pinned `postcss-selector-parser` and `sprintf-js` through `overrides`.

### Fixed

- Leaders now see all tasks of a project on the project detail page instead of only their assigned tasks.
- `deleteSection` recomputes the project end date after its tasks are removed.
- `readJSON` fails fast on corrupt JSON instead of retrying three times.
- Avoided mutating the Zustand project array when sorting the projects list.

### Removed

- Dead code (an empty effect in `error.tsx`, an unused `isActive` prop) and non-banner comments in the guard shell scripts.

## [v4.1.0] - 2026-10-09

### Added

- **Single language-aware input** for project titles, section titles, task titles, and task descriptions. Each field is now one input in the active UI language, and the other language is filled automatically.
- **Fully local translation** powered by NLLB-200 (`Xenova/nllb-200-distilled-600M`, int8 ONNX) through `@huggingface/transformers`, running on the CPU with no cloud API.
- `POST /api/translate` (authenticated and rate-limited) and `npm run models:download` to cache the model under `models/`.
- `translation.config.json` as the single source of truth for the model id, quantization, and language codes.

### Changed

- The script of the typed text decides the outcome: Arabic input in an Arabic UI is translated to English, while Latin input in an Arabic UI is stored as-is, and vice versa. Balanced mixed text is stored as-is.
- Task descriptions are translated per text node, so bold, italic, lists, links, and alignment are preserved; `code`, `pre`, `script`, and `style` are never translated.
- Documentation restructured to match the Orbiscreen layout: `docs/`, `.github/` templates and CI, `README_AR.md`, `.editorconfig`, `.gitattributes`, and version/comment guard scripts.

### Security

- Fixed privilege escalation via mass assignment on `PATCH /api/users/[id]`, where any user could overwrite `role` or `id` on their own record.
- Restricted `POST /api/users/reorder` and role changes to leaders.
- Added ownership checks (project, section, task) to task, section, project, attachment, and reorder endpoints, closing cross-project IDOR.
- Added a same-origin check for mutating API requests, proxy-aware client IP detection, a request-size limit before parsing uploads, and rate limiting on creation endpoints.
- Replaced the upload allow-list with JPEG/PNG/GIF/WebP only and added `fs.realpath` containment for the image route.
- Bumped Next.js to a patched release and forced a patched DOMPurify through `overrides`.

### Fixed

- Added missing locale keys (`common.nav.menu`, `dashboard.analytics.filters.dateRange`) that rendered as raw keys.
- Corrected the environment example to reference NLLB-200 instead of OPUS-MT.

### Removed

- Unused files (`components/common/index.tsx`, `components/ui/separatorUi.tsx`), dead exports, unused locale keys, and unused dependencies (`@types/dompurify`, `@radix-ui/react-separator`, `eslint-config-next`).
- All inline code comments; the policy is now enforced by `scripts/check-comments.sh`.

- Version bumped to 4.1.0 across package.json, documentation badges, and the changelog.

## [4.0.6] - 2026-05-15

### Changed

- **Updated author username** from SHADOW_x7 to Shadow-x78 with GitHub link in README, LICENSE, and package.json

---

## [4.0.5] - 2026-05-14

### Fixed

- **Fixed drag-and-drop** on desktop by lowering mobile breakpoint from 1024px to 768px
- **Fixed metadata icons** to reference existing SVG files instead of missing WebP files
- **Moved Font Awesome CSS** import from `<link>` tag to `@import` in globals.css

### Removed

- **Removed ESLint disable comment** for Font Awesome CSS link

---

## [4.0.4] - 2026-05-14

### Changed

- **Removed ESLint disable comments** from layout.tsx
- **Removed console.log/error statements** from error.tsx and pdfUtil.ts
- **Added missing version tags** for v4.0.0 through v4.0.4

---

## [4.0.3] - 2026-05-14

### Changed

- **Updated repository links** from `SHADOW-x7/taskboard` to `red-shadows-rs/taskboard`
- **Updated branding** from `RED SHADOWS` to `RED SHADOWS | RS`

---

## [4.0.2] - 2026-05-14

### Added

- **`.env.example`** file with placeholder values for required environment variables

### Changed

- **Restored original icon design** — simple 4-rectangle Kanban board SVG replacing the gradient design

---

## [4.0.1] - 2026-05-14

### Added

- **Arabic README** (`README.ar.md`) with full RTL-formatted documentation
- **Contributing Guide** (`CONTRIBUTING.md`) with commit format, code style, and PR workflow
- **Code of Conduct** (`CODE_OF_CONDUCT.md`) based on Contributor Covenant v2.1
- **Security Policy** (`SECURITY.md`) with vulnerability reporting process and supported versions

### Changed

- **Redesigned SVG icon** with gradient Kanban board design replacing low-resolution WebP icons
- **Reorganized English README** with professional layout, badges, roadmap, and improved structure
- **Updated PWA manifest** to use SVG icon instead of multiple WebP sizes
- **Cleaned sample data** from all database JSON files (now empty arrays for fresh starts)
- **Removed uploaded images** from `public/images/` directory
- **Fixed `.gitignore`** to track database files and image directory structure

### Removed

- Low-resolution WebP icon files (`icon-*.webp`, `favicon.webp`, `apple-touch-icon.webp`)

---

## [4.0.0] - 2026-05-14

### Added

- **Analytics Dashboard** with interactive charts (Recharts) for project progress, task distribution, and team performance
- **PDF Export Engine** for projects, sections, tasks, and analytics reports (jsPDF + jspdf-autotable)
- **PWA Support** with manifest.json, service worker, and multiple icon sizes (16px to 512px)
- **Team Management Page** with member listing, role assignment, and reordering
- **Profile Page** for editing user name, email, and password
- **Rich Text Editor** for task descriptions (Tiptap with starter-kit, placeholder, text-align, and underline extensions)
- **Drag & Drop Reordering** for tasks and sections (dnd-kit)
- **Bilingual Support** (English/Arabic) with dynamic locale loading, RTL layout, Cairo/Inter fonts
- **Dark/Light Theme** with system preference detection and HSL-based CSS custom properties
- **Rate Limiting** on authentication endpoints (in-memory, per-IP)
- **Security Headers** via next.config.ts (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- **Global Error Boundary** and custom 404 page
- **Scroll-to-Top** button component
- **Loading States** with skeleton components across all pages
- **Font Awesome 6** icon library integration
- **IBM Plex Sans Arabic** font for PDF exports

### Changed

- Upgraded to Next.js 16 with Turbopack dev server
- Migrated to ESLint 9 flat config
- Replaced basic text inputs with Tiptap rich text editor for task descriptions
- Enhanced task model with attachments, assignee pricing, and bilingual fields
- Improved form validation with Zod schemas across all API routes

### Fixed

- Session cookie security (httpOnly, secure in production, sameSite strict)
- Image upload path sanitization and UUID-based naming

---

## [3.0.0] - 2026-04-01

### Added

- **Project Management** with CRUD operations and status tracking (planning, active, completed, on_hold)
- **Section Management** within projects (Kanban columns)
- **Task CRUD** with file attachments stored in `public/images/`
- **User Roles** system: leader, member, client with role-based access control
- **Session-Based Authentication** with bcrypt password hashing and HMAC-SHA256 signed cookies
- **JSON File Database** layer with generic CRUD operations (`databaseShared.ts`)
- **Zod Validation** for all API inputs (`validatorsShared.ts`)
- **Zustand** global state management for UI state
- **Framer Motion** animations for page transitions and UI interactions
- **react-hot-toast** notification system
- **DOMPurify** for XSS sanitization of user-generated content
- **date-fns** for date formatting and manipulation
- **react-day-picker** date picker component
- **API Routes** for projects, sections, tasks, users, and authentication
- **Dashboard Layout** with authenticated route guard, navbar, and footer

### Changed

- Migrated from client-side state to server-side JSON persistence
- Reorganized component architecture into `common/`, `layouts/`, `pages/`, and `ui/` directories
- Standardized UI components with class-variance-authority and tailwind-merge

---

## [2.0.0] - 2026-03-01

### Added

- **Kanban Board UI** with task cards and column layout
- **Task Statuses**: todo, in_progress, in_review, done
- **Task Priorities**: low, medium, high, urgent
- **Task Tags** system (Frontend, Backend, etc.)
- **Due Dates** with visual indicators
- **Dashboard Layout** with responsive navbar and footer
- **Basic i18n Structure** with locale JSON files for auth, common, and dashboard sections
- **Language Context** with dynamic locale loading
- **Theme Provider** with next-themes integration
- **shadcn/ui Components**: Button, Input, Card, Dialog, DropdownMenu, Select, Badge, Avatar, Tabs, Separator, Popover, AlertDialog, Sheet, Label, Calendar
- **Lucide React** icon library
- **Tailwind CSS** with custom theme configuration and CSS variables
- **PostCSS** with autoprefixer

### Changed

- Redesigned login page with form validation and error handling
- Improved TypeScript strict mode configuration

---

## [1.0.0] - 2026-02-01

### Added

- **Next.js App Router** project initialization with TypeScript
- **Login Page** with basic form and routing
- **Root Layout** with metadata configuration
- **Route Redirect** from `/` to `/login`
- **Tailwind CSS** setup with base configuration
- **ESLint** and **Prettier** configuration
- **TypeScript** strict mode with path aliases (`@/*`)
- **Basic Project Structure**: `src/app/`, `src/components/`, `src/types/`, `src/utils/`
- **Type Definitions** for core entities (User, Project, Section, Task)
- **Font Awesome** CSS integration
- **PWA Icons** and manifest scaffolding

---

[v4.2.3]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.2.3
[v4.2.2]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.2.2
[v4.2.1]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.2.1
[v4.2.0]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.2.0
[v4.1.2]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.1.2
[v4.1.0]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.1.0
[4.0.6]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.6
[4.0.5]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.5
[4.0.4]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.4
[4.0.3]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.3
[4.0.2]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.2
[4.0.1]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.1
[4.0.0]: https://github.com/red-shadows-rs/taskboard/releases/tag/v4.0.0
[3.0.0]: https://github.com/red-shadows-rs/taskboard/releases/tag/v3.0.0
[2.0.0]: https://github.com/red-shadows-rs/taskboard/releases/tag/v2.0.0
[1.0.0]: https://github.com/red-shadows-rs/taskboard/releases/tag/v1.0.0
