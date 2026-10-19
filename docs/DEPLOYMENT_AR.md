<div align="center">

# دليل النشر والتشغيل للإنتاج - TaskBoard

[![Version](https://img.shields.io/badge/الإصدار-4.2.0-2563eb?style=flat-square&logo=semver)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/الترخيص-MIT-10b981?style=flat-square)](../LICENSE)
![Docker](https://img.shields.io/badge/دوكر-جاهز-2496ed?style=flat-square&logo=docker)
![Platform](https://img.shields.io/badge/المنصة-لينكس%20%7C%20استضافة_ذاتية-9333ea?style=flat-square&logo=linux)

</div>

---

## اللغة

<a href="DEPLOYMENT.md">🇬🇧 English</a> · <a href="DEPLOYMENT_AR.md">🇸🇦 العربية</a>

---

يوضح هذا الدليل كيفية نشر وتشغيل منصة TaskBoard في بيئة الإنتاج على خوادم لينكس باستخدام Docker Compose أو كخدمة Node.js مستقلة، مع إعداد خادم Nginx كوسيط عكسي وإدارة النسخ الاحتياطي لقاعدة بيانات SQLite.

---

## جدول المحتويات

- [متطلبات النظام](#system-requirements)
- [هيكلية المجلدات](#directory-layout)
- [إعداد متغيرات البيئة](#environment-configuration)
- [النشر باستخدام Docker Compose](#docker-deployment)
- [التشغيل المستقل بواسطة Node.js و Systemd](#standalone-deployment)
- [إعداد خادم Nginx العكسي](#nginx-configuration)
- [استمرارية البيانات والنسخ الاحتياطي الآلي](#backups)
- [إجراء التحديثات والصيانة](#maintenance)

---

<a id="system-requirements"></a>

## متطلبات النظام

- **نظام التشغيل:** لينكس (Ubuntu 22.04+ أو Debian 12+ أو Rocky Linux أو Arch Linux)
- **المعالج:** 1 vCPU كحد أدنى (يوصى بـ 2 vCPU لعمليات تصدير تقارير PDF المتزامنة)
- **الذاكرة العشوائية (RAM):** 1 جيجابايت كحد أدنى (يوصى بـ 2 جيجابايت)
- **مساحة التخزين:** 5 جيجابايت SSD كحد أدنى
- **البرمجيات المطلوبة:** Docker Engine >= 24.0 و Docker Compose v2 و Nginx و Certbot لتثبيت شهادات SSL

---

<a id="directory-layout"></a>

## هيكلية المجلدات

الهيكلية الموصى بها على الخادم المضيف:

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

## إعداد متغيرات البيئة

قم بإنشاء الملف `/var/www/taskboard/.env.local`:

```bash
# توليد مفتاح جلسات عشوائي قوي مشفر:
openssl rand -base64 48
```

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
SESSION_SECRET="المفتاح_العشوائي_المولد_بحجم_32_حرفا_على_الأقل"
TRUST_PROXY=true
DATA_DIR=./data
DATABASE_PATH=./data/taskboard.sqlite
```

---

<a id="docker-deployment"></a>

## النشر باستخدام Docker Compose

### 1. البناء والتشغيل

```bash
cd /var/www/taskboard
docker compose up -d --build
```

### 2. التحقق من سلامة الحاوية

```bash
docker compose ps
docker compose logs -f app
```

توفر الحاوية فحصاً آلياً للسلامة عبر المسار الداخلي `/api/health`.

---

<a id="standalone-deployment"></a>

## التشغيل المستقل بواسطة Node.js و Systemd

في حال الرغبة في التشغيل المباشر على لينكس بدون دوكر:

### 1. بناء ملفات الإنتاج

```bash
npm install --include=dev
npm run build
```

### 2. تكوين خدمة Systemd

أنشئ الملف `/etc/systemd/system/taskboard.service`:

```ini
[Unit]
Description=TaskBoard Standalone Application
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

## إعداد خادم Nginx العكسي

قم بربط إعدادات `nginx/taskboard.conf` بالمسار `/etc/nginx/sites-available/taskboard.conf`:

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

## استمرارية البيانات والنسخ الاحتياطي الآلي

نظراً لعمل SQLite في وضع WAL، يجب أخذ النسخ الاحتياطية بأمان عبر واجهة النسخ الاحتياطي المباشرة:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/www/taskboard/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# لقطة حية آمنة لقاعدة بيانات SQLite
node -e "
const Database = require('better-sqlite3');
const db = new Database('/var/www/taskboard/data/taskboard.sqlite');
db.backup('${BACKUP_DIR}/taskboard_${TIMESTAMP}.sqlite').then(() => console.log('تم النسخ الاحتياطي بنجاح'));
"

# أرشفة مجلد المرفقات
tar -czf "${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz" -C /var/www/taskboard uploads

# الاحتفاظ بالنسخ لآخر 14 يوماً فقط
find "$BACKUP_DIR" -type f -mtime +14 -delete
```

---

<div align="center">

صُنع بواسطة <a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a> (<a href="https://github.com/shadow-x78">shadow-x78</a>)

</div>
