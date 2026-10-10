# Naming Conventions — TaskBoard

This document records the naming conventions TaskBoard already follows. It is based on evidence gathered by the naming audit (counts over the tracked `src/` tree, Next.js 16.4.0, React 18, TypeScript 5). New code must match these rules.

## Conventions by kind

| Kind                                      | Convention                             | Example                                                 |
| ----------------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| Variables, functions, methods, properties | `camelCase`                            | `calculateProjectEndDate`, `sectionIds`                 |
| Classes, interfaces, type aliases, enums  | `PascalCase`, no `I` prefix            | `LanguageContextType`, `TranslationOutput`              |
| React components                          | `PascalCase` (file stays `camelCase`)  | `export function ThemeToggle()` in `settingsCommon.tsx` |
| True constants                            | `UPPER_SNAKE_CASE`                     | `MAX_INPUT_CHARS`, `MUTATING_METHODS`                   |
| Other constants                           | `camelCase`                            | `dataDir`, `globalForTranslator`                        |
| Booleans                                  | `isX` / `hasX` / `canX` / `shouldX`    | `isLoaded`, `isMobile`, `isDragActive`                  |
| Event handlers / handler props            | `handleX` / `onX`                      | `handleExportPDF`, `onEdit`, `onValueChange`            |
| Custom hooks                              | `useX`                                 | `useLanguage`, `useTheme`                               |
| Module file names                         | `camelCase.ts(x)`                      | `buttonUi.tsx`, `databaseShared.ts`                     |
| Folders                                   | lowercase words; route segments plural | `components/ui`, `dashboard/projects`                   |
| Tests                                     | `*.test.ts`                            | `pricingUtils.test.ts`                                  |
| CSS classes and custom properties         | `kebab-case`                           | `.animate-in`, `--primary-foreground`                   |
| Environment variables                     | `UPPER_SNAKE_CASE`                     | `SESSION_SECRET`, `TRUST_PROXY`                         |
| API and database JSON keys                | `camelCase`                            | `startDate`, `teamMembers`, `createdBy`                 |
| i18n message keys                         | `camelCase`                            | `nav.analytics`, `button.downloadPDF`                   |

Ignored caught errors use a leading underscore (`_error`, `_err`, `_e`) — ESLint `caughtErrorsIgnorePattern: ^_`.

## Framework-required names (never change)

Next.js App Router special files and runtime files are fixed by the framework:

- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `globals.css`
- `src/proxy.ts` — the Next.js 16 name for middleware (reported by the build as `ƒ Proxy (Middleware)`)

Route segments are also fixed: `[id]` (dynamic), `[...path]` (catch-all), `(group)`, `_folder`, `@slot`.

## Frozen contract names (do not rename without a migration plan)

| Name                                                                                                  | Location                         | Why frozen                                                      |
| ----------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------- |
| `translation_text`, `src_lang`, `tgt_lang`, `max_new_tokens`                                          | `src/lib/translationServer.ts`   | keys of the `@huggingface/transformers` pipeline API            |
| `__taskboardTranslator`                                                                               | `src/lib/translationServer.ts`   | `globalThis` key surviving hot reloads                          |
| `in_progress`, `in_review`, `on_hold`, `todo`, `done`, `planning`, `active`, `completed`              | `src/types/index.ts`             | persisted status values in `databases/*.json`; mirrored in i18n |
| i18n leaf keys `status.*`                                                                             | `public/locales/**/*Locale.json` | mirror stored status values                                     |
| Route segments and API paths (`/api/projects/[id]`, `/api/images/[...path]`, `/dashboard/...`)        | `src/app/**`                     | public URLs consumed by clients                                 |
| Env variable names (`SESSION_SECRET`, `TRUST_PROXY`, `TRANSLATION_ENABLED`, `TRANSLATION_MODELS_DIR`) | `.env.example`, code             | deployment contract                                             |
| `package.json` `name` (`taskboard`)                                                                   | `package.json`                   | package identity                                                |

## Good examples

```ts
const MAX_SEGMENTS = 200; // true constant
const translator = await getTranslator(); // camelCase value
function runExclusive<T>(task: () => Promise<T>): Promise<T> {} // camelCase helper
export function useLanguage() {} // hook
export function ThemeToggle() {} // component
interface TranslationOptions {
  src_lang?: string;
} // PascalCase type; snake keys are external contract
```

## Commands to check conventions

```bash
npm run format:check   # Prettier
npm run lint           # ESLint (typescript-eslint, react, @next/next)
npm run type-check     # tsc --noEmit
npm run test           # Vitest
npm run build          # Next.js production build
```

No automated naming lint rule is enabled (`ADD_LINT_RULES = no`). Candidate rules, if approved later, are `@typescript-eslint/naming-convention`, `unicorn/filename-case` (with ignores for Next.js special files and `[param]` folders), and `react/jsx-pascal-case`.
