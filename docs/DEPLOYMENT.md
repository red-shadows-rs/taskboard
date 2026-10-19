<div align="center">

# Production Deployment Guide - Taskboard

[![Version](https://img.shields.io/badge/version-4.2.0-2563eb?style=flat-square&logo=semver)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](../LICENSE)
![Docker](https://img.shields.io/badge/docker-ready-2496ed?style=flat-square&logo=docker)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Self--Hosted-9333ea?style=flat-square&logo=linux)

</div>

---

## Language

<a href="DEPLOYMENT.md">🇬🇧 English</a> · <a href="DEPLOYMENT_AR.md">🇸🇦 العربية</a>

---

This guide outlines deploying Taskboard into production using Docker Compose or standalone Node.js, combined with Nginx as a TLS termination reverse proxy and local SQLite volume persistence.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Directory Layout](#directory-layout)
- [Environment Configuration](#environment-configuration)
- [Docker Compose Deployment](#docker-deployment)
- [Standalone Node.js & Systemd](#standalone-deployment)
- [Nginx Reverse Proxy Configuration](#nginx-configuration)
- [Database Persistence & Automated Backups](#backups)
- [Updating & Maintenance](#maintenance)

---

<a id="system-requirements"></a>

## System Requirements

- **Operating System:** Linux (Ubuntu 22.04+, Debian 12+, Rocky Linux, Arch Linux)
- **CPU:** 1 vCPU minimum (2 vCPU recommended for concurrent PDF exports)
- **RAM:** 1 GB minimum (2 GB recommended)
- **Disk Space:** 5 GB SSD minimum
- **Installed Software:** Docker Engine >= 24.0, Docker Compose v2, Nginx, Certbot (Let's Encrypt)

---

<a id="directory-layout"></a>

## Directory Layout

Recommended host deployment structure:

```
/var/www/taskboard/
├── docker-compose.yml
├── .env.local
├── data/
│   ├── taskboard.sqlite
│   ├── taskboard.sqlite-wal
│   └── taskboard-demo.sqlite
├── uploads/
│   └── [attachment-uuid.png]
└── backups/
```

---

<a id="environment-configuration"></a>

## Environment Configuration

Create `/var/www/taskboard/.env.local`:

```bash
# Generate a cryptographically secure session key:
openssl rand -base64 48
```

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
SESSION_SECRET="your_generated_random_string_at_least_32_chars"
TRUST_PROXY=true
DATA_DIR=./data
DATABASE_PATH=./data/taskboard.sqlite
```

---

<a id="docker-deployment"></a>

## Docker Compose Deployment

### 1. Build and Launch

```bash
cd /var/www/taskboard
docker compose up -d --build
```

### 2. Verify Container Health

```bash
docker compose ps
docker compose logs -f app
```

The container exposes health check status at `/api/health`.

---

<a id="standalone-deployment"></a>

## Standalone Node.js & Systemd

If deploying directly on a Linux server without Docker:

### 1. Build Production Assets

```bash
npm install --include=dev
npm run build
```

### 2. Configure Systemd Service

Create `/etc/systemd/system/taskboard.service`:

```ini
[Unit]
Description=Taskboard Standalone Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/taskboard
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
EnvironmentFile=/var/www/taskboard/.env.local

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now taskboard
```

---

<a id="nginx-configuration"></a>

## Nginx Reverse Proxy Configuration

Deploy `nginx/taskboard.conf` to `/etc/nginx/sites-available/taskboard.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=taskboard_public:10m rate=30r/m;

server {
  listen 80;
  listen [::]:80;
  server_name taskboard.example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name taskboard.example.com;

  ssl_certificate     /etc/letsencrypt/live/taskboard.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/taskboard.example.com/privkey.pem;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  client_max_body_size 25m;

  location ~ ^/(api/auth/login|demo) {
    limit_req zone=taskboard_public burst=10 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/taskboard.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

<a id="backups"></a>

## Database Persistence & Automated Backups

Because SQLite operates in WAL mode, backups should use SQLite's safe vacuum or online backup api:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/www/taskboard/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Online safe SQLite snapshot
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/www/taskboard/data/taskboard.sqlite');
db.backup('${BACKUP_DIR}/taskboard_${TIMESTAMP}.sqlite').then(() => console.log('Backup successful'));
"

# Archive uploads directory
tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" -C /var/www/taskboard uploads

# Retain last 14 days
find "$BACKUP_DIR" -type f -mtime +14 -delete
```

Add this script to cron (`crontab -e`) to run nightly at 02:00 AM.

---

<a id="maintenance"></a>

## Updating & Maintenance

To perform a zero-downtime update:

```bash
git pull origin main
docker compose build app
docker compose up -d --no-deps app
```

---

<div align="center">

Built by <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[Back to README](../README.md)

<sub>&copy; 2026 Taskboard (shadow-x78)</sub>

</div>
