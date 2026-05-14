# Changelog

All notable changes to TaskBoard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.0.4] - 2026-05-14

### Changed

- **Removed ESLint disable comments** from layout.tsx
- **Removed console.log/error statements** from error.tsx and pdfUtil.ts
- **Added missing version tags** for v4.0.0 through v4.0.4

---

## [4.0.3] - 2026-05-14

### Changed

- **Updated repository links** from `SHADOW-x7/taskboard` to `red-shadows-rs/TaskBoard`
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

[4.0.4]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v4.0.4
[4.0.3]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v4.0.3
[4.0.2]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v4.0.2
[4.0.1]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v4.0.1
[4.0.0]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v4.0.0
[3.0.0]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v3.0.0
[2.0.0]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v2.0.0
[1.0.0]: https://github.com/red-shadows-rs/TaskBoard/releases/tag/v1.0.0
