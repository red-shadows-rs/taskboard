<div align="center">

# دليل واجهات البرمجة (API Specification) - Taskboard

[![Version](https://img.shields.io/badge/الإصدار-4.2.0-2563eb?style=flat-square&logo=semver)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/الترخيص-GPL--3.0-dc2626?style=flat-square)](../LICENSE)
![TypeScript](https://img.shields.io/badge/تايب_سScript-5%2B-3178c6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/المنصة-لينكس%20%7C%20استضافة_ذاتية-9333ea?style=flat-square&logo=linux)

</div>

---

## اللغة

<a href="API_SPEC.md">🇬🇧 English</a> · <a href="API_SPEC_AR.md">🇸🇦 العربية</a>

---

يوضح هذا المستند تفاصيل مسارات واجهات REST API، ومخططات البيانات، والمتطلبات الأمنية، وحالات الاستجابة لمنصة Taskboard.

---

## جدول المحتويات

- [نموذج المصادقة والجلسات](#auth-model)
- [مسارات النظام والديمو](#system-endpoints)
  - [فحص صحة النظام (`GET /api/health`)](#health-probe)
  - [الدخول السريع للديمو (`GET /demo`)](#demo-login)
  - [إعادة ضبط الديمو (`POST /api/demo/reset`)](#demo-reset)
  - [الخروج من الديمو (`POST /api/demo/exit`)](#demo-exit)
- [مسارات المصادقة والمستخدمين](#auth-endpoints)
  - [تسجيل الدخول (`POST /api/auth/login`)](#login)
  - [بيانات الجلسة الحالية (`GET /api/auth/me`)](#me)
  - [تسجيل الخروج (`POST /api/auth/logout`)](#logout)
- [واجهة برمجة المشاريع (Projects)](#projects-api)
- [واجهة برمجة الأقسام (Sections)](#sections-api)
- [واجهة برمجة المهام (Tasks)](#tasks-api)
- [واجهة إدارة الفريق (Users)](#users-api)
- [خدمة المرفقات الخاصة (`GET /api/images/[...path]`)](#attachments-api)

---

<a id="auth-model"></a>

## نموذج المصادقة والجلسات

تتطلب جميع المسارات الحساسة وجود ملف تعريف الارتباط الموقع `taskboard_session`. وعند تصفح البيئة التجريبية، يتم إرسال `taskboard_demo=1` مما يوجه العمليات تلقائياً إلى قاعدة بيانات `taskboard-demo.sqlite`.

---

<a id="system-endpoints"></a>

## مسارات النظام والديمو

<a id="health-probe"></a>

### 1. فحص صحة النظام (`GET /api/health`)

يستخدم لفحص جاهزية الحاوية في بيئة Docker.

- **الصلاحية:** متاح للعامة (Public)
- **الاستجابة:** `200 OK`

```json
{
  "status": "ok",
  "uptime": 1420.5,
  "timestamp": "2026-10-20T00:30:00.000Z"
}
```

<a id="demo-login"></a>

### 2. الدخول الفوري للديمو (`GET /demo`)

تسجيل دخول فوري بنقرة واحدة إلى البيئة التجريبية دون الحاجة لإدخال بيانات.

- **الاستجابة:** إعادة توجيه `303 See Other` إلى `/dashboard/tasks` وضبط ملفات الجلسة والديمو.

<a id="demo-reset"></a>

### 3. إعادة ضبط الديمو (`POST /api/demo/reset`)

يعيد قاعدة بيانات الديمو إلى حالتها الأصلية الأولى.

- **الاستجابة:** `200 OK`

```json
{ "success": true }
```

<a id="demo-exit"></a>

### 4. الخروج من الديمو (`POST /api/demo/exit`)

حذف ملفات تعريف الارتباط وإنهاء الجلسة.

- **الاستجابة:** `200 OK`

```json
{ "success": true }
```

---

<a id="auth-endpoints"></a>

## مسارات المصادقة والمستخدمين

<a id="login"></a>

### 1. تسجيل الدخول (`POST /api/auth/login`)

- **حد الطلبات:** 5 محاولات لكل 15 دقيقة لكل عنوان IP.
- **البيانات المطلوبة:**

```json
{
  "email": "admin@taskboard.local",
  "password": "adminpassword"
}
```

<a id="me"></a>

### 2. الجلسة الحالية (`GET /api/auth/me`)

إرجاع بيانات وصلاحيات المستخدم المسجل حالياً.

---

<a id="projects-api"></a>

## واجهة برمجة المشاريع (Projects)

- `GET /api/projects`: عرض قائمة المشاريع.
- `POST /api/projects`: إنشاء مشروع جديد (للقائد فقط).
- `GET /api/projects/:id`: جلب تفاصيل مشروع محدد.
- `PUT /api/projects/:id`: تعديل بيانات المشروع.
- `DELETE /api/projects/:id`: حذف المشروع وحذف كافة أقسامه ومهامه تلقائياً.

---

<a id="sections-api"></a>

## واجهة برمجة الأقسام (Sections)

- `GET /api/sections`: جلب كافة الأقسام.
- `POST /api/sections`: إضافة عمود جديد في لوحة كانبان.
- `PUT /api/sections/reorder`: تحديث ترتيب الأعمدة.

---

<a id="tasks-api"></a>

## واجهة برمجة المهام (Tasks)

- `GET /api/tasks`: جلب المهام.
- `POST /api/tasks`: إنشاء مهمة جديدة بحقول ثنائية اللغة (عربي وإنجليزي).
- `PUT /api/tasks/:id`: تحديث المهمة.
- `PUT /api/tasks/reorder`: نقل المهمة وإعادة ترتيب موقعها في لوحة كانبان.
- `POST /api/tasks/:id/image`: رفع مرفق صورة خاص للمهمة.

---

<a id="attachments-api"></a>

## خدمة المرفقات الخاصة (`GET /api/images/[...path]`)

يتم تقديم ملفات المرفقات المخزنة في مجلد `/uploads` فقط للمستخدمين المعتمدين لمنع الوصول غير المصرح به للملفات عبر الروابط المباشرة.

---

<div align="center">

بُني بواسطة <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[العودة إلى README](../README_AR.md)

<sub>&copy; 2026 Taskboard (shadow-x78)</sub>

</div>
