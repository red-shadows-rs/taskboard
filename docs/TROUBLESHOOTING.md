<div align="center">

# Troubleshooting Guide - TaskBoard

[![Version](https://img.shields.io/badge/version-4.2.0-2563eb?style=flat-square&logo=semver)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](../LICENSE)
![TypeScript](https://img.shields.io/badge/typescript-5%2B-3178c6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Self--Hosted-9333ea?style=flat-square&logo=linux)

</div>

---

## Language

<a href="TROUBLESHOOTING.md">🇬🇧 English</a> · <a href="TROUBLESHOOTING_AR.md">🇸🇦 العربية</a>

---

This document outlines common diagnostic procedures, error resolutions, and operational fixes for TaskBoard deployments.

---

## Table of Contents

- [SQLite Database Lock or Busy Errors](#sqlite-errors)
- [Docker Container Permissions on `/app/data`](#docker-permissions)
- [Session Cookies Dropped Behind Reverse Proxy](#cookie-issues)
- [Rate Limiter Blocking Legitimate Traffic](#rate-limiting)
- [Arabic Cairo Font Not Rendering in PDF Exports](#pdf-fonts)
- [Mobile Drag-and-Drop Touch Lag](#touch-drag)

---

<a id="sqlite-errors"></a>

## SQLite Database Lock or Busy Errors

**Symptom:** API requests return `SQLITE_BUSY: database is locked` or timeouts.

**Cause:** A lingering process holding an uncommitted write lock, or the database file is placed on a network filesystem (such as NFS or SMB) that does not support POSIX advisory locks properly.

**Fix:**

1. Ensure the SQLite database resides on a local SSD block storage volume, not on a network drive.
2. Verify WAL mode and busy timeout pragmas are active:

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('data/taskboard.sqlite');
console.log('Journal mode:', db.pragma('journal_mode', { simple: true }));
console.log('Busy timeout:', db.pragma('busy_timeout', { simple: true }));
"
```

3. Checkpoint the WAL file manually if uncommitted logs accumulate:

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('data/taskboard.sqlite');
db.pragma('wal_checkpoint(TRUNCATE)');
console.log('WAL checkpointed');
"
```

---

<a id="docker-permissions"></a>

## Docker Container Permissions on `/app/data`

**Symptom:** Container crashes with `EACCES: permission denied, open '/app/data/taskboard.sqlite'`.

**Cause:** The container runs as the unprivileged user `node` (UID 1000), while the mounted host `./data` directory is owned by `root`.

**Fix:**
Set ownership of the persistent host volumes:

```bash
sudo chown -R 1000:1000 ./data ./uploads
sudo chmod -R 755 ./data ./uploads
```

---

<a id="cookie-issues"></a>

## Session Cookies Dropped Behind Reverse Proxy

**Symptom:** User submits login successfully, but subsequent requests redirect back to `/login`.

**Cause:** `NODE_ENV=production` sets `secure: true` on cookies. If the client connects over plain HTTP, or if the reverse proxy fails to forward the `X-Forwarded-Proto: https` header, the browser refuses to store or send the cookie.

**Fix:**

1. Ensure HTTPS is enabled with valid SSL/TLS certificates.
2. In your Nginx server block, ensure proxy headers are present:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

3. Set `TRUST_PROXY=true` in `.env.local`.

---

<a id="rate-limiting"></a>

## Rate Limiter Blocking Legitimate Traffic

**Symptom:** Login returns HTTP 429 `Too many login attempts. Please try again later.`

**Cause:** Multiple users sharing a single corporate NAT IP or office proxy, or tests hitting the 5-attempt limit.

**Fix:**

1. Rate limit tokens reside in-memory and reset automatically after 15 minutes.
2. To reset immediately, restart the TaskBoard process:

```bash
# Docker Compose:
docker compose restart app

# Systemd:
sudo systemctl restart taskboard
```

---

<a id="pdf-fonts"></a>

## Arabic Cairo Font Not Rendering in PDF Exports

**Symptom:** Exported PDF displays question marks or broken isolated glyphs for Arabic text.

**Cause:** Missing TrueType font definition or missing bidirectional shaping step.

**Fix:**
Ensure `src/utils/pdfUtil.ts` embeds the Cairo font using the provided TrueType buffer. Clean browser cache and reload the application.

---

<a id="touch-drag"></a>

## Mobile Drag-and-Drop Touch Lag

**Symptom:** Dragging task cards on mobile triggers screen scrolling instead of moving cards.

**Cause:** Missing CSS touch-action rules on drag handles.

**Fix:**
Ensure drag handles specify `touch-action: none` and use activation constraints (`delay: 150ms`, `tolerance: 5px`) to distinguish scrolling gestures from intentional card moves.

---

<div align="center">

Built by <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[Back to README](../README.md)

<sub>&copy; 2026 TaskBoard (shadow-x78)</sub>

</div>
