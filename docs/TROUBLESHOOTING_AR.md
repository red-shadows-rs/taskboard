<div align="center">

# دليل استكشاف الأخطاء وإصلاحها - TaskBoard

[![Version](https://img.shields.io/badge/الإصدار-4.2.0-2563eb?style=flat-square&logo=semver)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/الترخيص-MIT-10b981?style=flat-square)](../LICENSE)
![TypeScript](https://img.shields.io/badge/تايب_سScript-5%2B-3178c6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/المنصة-لينكس%20%7C%20استضافة_ذاتية-9333ea?style=flat-square&logo=linux)

</div>

---

## اللغة

<a href="TROUBLESHOOTING.md">🇬🇧 English</a> · <a href="TROUBLESHOOTING_AR.md">🇸🇦 العربية</a>

---

يوضح هذا الدليل الإجراءات التشخيصية الشائعة وحلول المشكلات التشغيلية لمنصة TaskBoard.

---

## جدول المحتويات

- [أخطاء قفل قاعدة البيانات (SQLite Locked / Busy)](#sqlite-errors)
- [مشاكل صلاحيات المجلدات في Docker (`/app/data`)](#docker-permissions)
- [فقدان ملفات تعريف الارتباط للجلسات خلف الوسيط العكسي](#cookie-issues)
- [حظر محدد الطلبات لحركة المرور الشرعية](#rate-limiting)
- [عدم ظهور خط القاهرة العربي في تقارير PDF](#pdf-fonts)
- [مشاكل السحب والإفلات على الأجهزة اللمسية](#touch-drag)

---

<a id="sqlite-errors"></a>

## أخطاء قفل قاعدة البيانات (SQLite Locked / Busy)

**العَرَض:** إرجاع أخطاء `SQLITE_BUSY: database is locked` عند إجراء عمليات كتابة.

**السبب:** وجود عملية عالقة تحتفظ بقفل كتابة، أو وجود ملف قاعدة البيانات على قرص شبكي (مثل NFS) لا يدعم أقفال POSIX بكفاءة.

**الحل:**

1. التأكد من حفظ قاعدة البيانات على قرص تخزين محلي سريع (SSD Local Volume).
2. التحقق من تفعيل وضع WAL ومهلة الانتظار 5 ثوانٍ:

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('data/taskboard.sqlite');
console.log('وضع السجل:', db.pragma('journal_mode', { simple: true }));
console.log('مهلة الانتظار:', db.pragma('busy_timeout', { simple: true }));
"
```

3. تنفيذ نقطة حفظ يدوية (Checkpoint) في حال تراكم السجلات:

```bash
node -e "
const Database = require('better-sqlite3');
const db = new Database('data/taskboard.sqlite');
db.pragma('wal_checkpoint(TRUNCATE)');
console.log('تم تفريغ سجلات WAL بنجاح');
"
```

---

<a id="docker-permissions"></a>

## مشاكل صلاحيات المجلدات في Docker (`/app/data`)

**العَرَض:** توقف الحاوية مع رسالة خطأ `EACCES: permission denied, open '/app/data/taskboard.sqlite'`.

**السبب:** تعمل الحاوية تحت المستخدم غير المميز `node` (UID 1000)، بينما المجلد المربوط مملوك للمستخدم `root`.

**الحل:**
تعديل ملكية مجلدات التخزين على الخادم المضيف:

```bash
sudo chown -R 1000:1000 ./data ./uploads
sudo chmod -R 755 ./data ./uploads
```

---

<a id="cookie-issues"></a>

## فقدان ملفات تعريف الارتباط للجلسات خلف الوسيط العكسي

**العَرَض:** نجاح تسجيل الدخول ولكن الصفحة تعيد التحويل تلقائياً إلى صفحة الدخول.

**السبب:** يفرض وضع الإنتاج التشفير الآمن `secure: true` لملفات الكوكيز. فإذا كان الاتصال عبر HTTP غير مشفر أو لم يقم Nginx بتمرير ترويسة `X-Forwarded-Proto: https`، سيرفض المتصفح حفظ الكوكيز.

**الحل:**

1. تفعيل شهادة SSL والتأكد من فتح الموقع عبر HTTPS.
2. التأكد من وجود ترويسات التوجيه في إعدادات Nginx:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

3. ضبط `TRUST_PROXY=true` داخل الملف `.env.local`.

---

<a id="rate-limiting"></a>

## حظر محدد الطلبات لحركة المرور الشرعية

**العَرَض:** ظهور خطأ HTTP 429 `Too many login attempts. Please try again later.`

**الحل:**
يتم تخزين الرموز في الذاكرة المؤقتة ويتم تجديدها تلقائياً بعد 15 دقيقة. لإلغاء الحظر فوراً يمكنك إعادة تشغيل الخادم:

```bash
# في بيئة Docker:
docker compose restart app

# في بيئة Systemd:
sudo systemctl restart taskboard
```

---

<a id="touch-drag"></a>

## مشاكل السحب والإفلات على الأجهزة اللمسية

**العَرَض:** التمرير على الجوال يحرك الشاشة بدلاً من سحب بطاقة المهمة.

**الحل:**
التأكد من خاصية `touch-action: none` على مقابض السحب وضبط قيود التفعيل الزمني (`delay: 150ms`).

---

<div align="center">

بُني بواسطة <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[العودة إلى README](../README_AR.md)

<sub>&copy; 2026 TaskBoard (shadow-x78)</sub>

</div>
