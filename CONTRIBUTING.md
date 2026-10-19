<div align="center">

# Contributing to Taskboard

[![Version](https://img.shields.io/badge/version-4.2.0-2563eb?style=flat-square&logo=semver)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](LICENSE)
![TypeScript](https://img.shields.io/badge/typescript-5%2B-3178c6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Self--Hosted-9333ea?style=flat-square&logo=linux)

</div>

---

Contributions to Taskboard are welcome. Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## Table of Contents

- [Day-to-Day Work](#day-to-day-work)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Code Style & Comment Policy](#code-style)
- [Release Process](#release-process)

---

<a id="day-to-day-work"></a>

## Day-to-Day Work

- **Branches:** `feature/`, `fix/`, `docs/`, `chore/` prefixes (e.g. `feature/sqlite-wal`), branched from `main`.
- **Commits:** `taskboard | <type>: <description>` for work, `taskboard | vX.Y.Z | <type>: <description>` for release commits. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **Style:** All code formatted with Prettier (`npm run format`), clean under ESLint (`npm run lint`), strict TypeScript (`npm run type-check`), and zero inline code comments (`npm run check:comments`). Every file header follows the standard boxed banner style:

```ts
// ─────────────────────────────────────────────
// Taskboard - <File Description or Component>
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────
```

- **Toolchain:** Node.js 22+, npm 10+, SQLite 3.
- **Pull requests:** from a fork, targeting `main`, with tests green (`npm test`), a `CHANGELOG.md` entry, and clean validation.

---

<a id="how-to-contribute"></a>

## How to Contribute

### Reporting Bugs

Before submitting a bug report:

1. Check the [existing issues](https://github.com/red-shadows-rs/taskboard/issues) to avoid duplicates.
2. Use the bug report template if available.
3. Include detailed steps to reproduce, expected behavior, and actual behavior.
4. Include environment details: Node.js version, browser, OS.

### Suggesting Features

1. Check [existing issues](https://github.com/red-shadows-rs/taskboard/issues).
2. Open a feature request with a clear description of the problem and proposed solution.
3. Include use cases and any relevant examples.

### Pull Requests

1. Fork the repository.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the project's code style.
4. Ensure all checks pass:
   ```bash
   npm run validate
   npm run check:comments
   npm test
   ```
5. Write clear, descriptive commit messages.
6. Push your branch and open a pull request against `main`.

---

<a id="development-setup"></a>

## Development Setup

```bash
git clone https://github.com/red-shadows-rs/taskboard.git
cd taskboard
npm install
cp .env.example .env.local
npm run dev
```

---

<a id="code-style"></a>

## Code Style & Comment Policy

- TypeScript strict mode is enabled.
- ESLint flat config with typescript-eslint.
- Prettier for formatting (2-space indentation, LF line endings, semicolons).
- **Strict Code Comment Policy:** Zero inline comments inside functions, JSX, or scripts. Only the standard boxed attribution banner at the top of the file followed by an empty line is permitted. Run `npm run check:comments` before committing.

---

<a id="release-process"></a>

## Release Process (maintainers)

A release is ONE commit containing the pending work plus the version bump:

1. Synchronize the version in all version locations using the automated script:
   ```bash
   bash scripts/set-version.sh <version> "<summary>"
   ```
2. Validate consistency:
   ```bash
   npm run check:versions
   npm run check
   ```
3. Commit and tag:
   ```bash
   git commit -m "taskboard | vX.Y.Z | release: official vX.Y.Z production release"
   git tag -a vX.Y.Z -m "Taskboard vX.Y.Z"
   ```

---

<div align="center">

Built by <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[Back to README](README.md)

<sub>&copy; 2026 Taskboard (shadow-x78)</sub>

</div>
