<div align="center">

# API Specification - Taskboard

[![Version](https://img.shields.io/badge/version-4.2.0-2563eb?style=flat-square&logo=semver)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/license-GPL--3.0-dc2626?style=flat-square)](../LICENSE)
![TypeScript](https://img.shields.io/badge/typescript-5%2B-3178c6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Self--Hosted-9333ea?style=flat-square&logo=linux)

</div>

---

## Language

<a href="API_SPEC.md">🇬🇧 English</a> · <a href="API_SPEC_AR.md">🇸🇦 العربية</a>

---

This document outlines the REST API endpoints, payload schemas, security requirements, and response structures supported by Taskboard.

---

## Table of Contents

- [Authentication & Session Model](#auth-model)
- [System Endpoints](#system-endpoints)
  - [Health Probe (`GET /api/health`)](#health-probe)
  - [Instant Live Demo Login (`GET /demo`)](#demo-login)
  - [Reset Demo Sandbox (`POST /api/demo/reset`)](#demo-reset)
  - [Exit Demo Sandbox (`POST /api/demo/exit`)](#demo-exit)
- [Authentication Endpoints](#auth-endpoints)
  - [User Login (`POST /api/auth/login`)](#login)
  - [Current Session (`GET /api/auth/me`)](#me)
  - [User Logout (`POST /api/auth/logout`)](#logout)
- [Projects API](#projects-api)
- [Sections API](#sections-api)
- [Tasks API](#tasks-api)
- [Users API](#users-api)
- [Private Attachments (`GET /api/images/[...path]`)](#attachments-api)

---

<a id="auth-model"></a>

## Authentication & Session Model

All mutating and sensitive endpoints require the `taskboard_session` signed HTTP cookie. When exploring within the demo sandbox, clients also send `taskboard_demo=1` which automatically routes database operations to `taskboard-demo.sqlite`.

---

<a id="system-endpoints"></a>

## System Endpoints

<a id="health-probe"></a>

### 1. Health Probe (`GET /api/health`)

Used by Docker health checks and external monitoring probes.

- **Auth:** None (Public)
- **Response:** `200 OK`

```json
{
  "status": "ok",
  "uptime": 1420.5,
  "timestamp": "2026-10-20T00:30:00.000Z"
}
```

<a id="demo-login"></a>

### 2. Instant Live Demo Login (`GET /demo`)

Provides instant, one-click sandbox authentication without credentials.

- **Auth:** None (Public)
- **Response:** `303 See Other` &rarr; Redirects to `/dashboard/tasks` with `taskboard_session` and `taskboard_demo=1` cookies.

<a id="demo-reset"></a>

### 3. Reset Demo Sandbox (`POST /api/demo/reset`)

Resets `taskboard-demo.sqlite` to initial pristine demo seed data.

- **Auth:** Demo session required
- **Response:** `200 OK`

```json
{ "success": true }
```

<a id="demo-exit"></a>

### 4. Exit Demo Sandbox (`POST /api/demo/exit`)

Terminates the sandbox session and deletes cookies.

- **Response:** `200 OK`

```json
{ "success": true }
```

---

<a id="auth-endpoints"></a>

## Authentication Endpoints

<a id="login"></a>

### 1. User Login (`POST /api/auth/login`)

- **Rate Limit:** 5 requests per 15 minutes per IP.
- **Payload:**

```json
{
  "email": "admin@taskboard.local",
  "password": "adminpassword"
}
```

- **Response:** `200 OK` sets signed `taskboard_session` cookie.

<a id="me"></a>

### 2. Current Session (`GET /api/auth/me`)

Returns the authenticated user's profile and permissions.

---

<a id="projects-api"></a>

## Projects API

- `GET /api/projects`: List all projects.
- `POST /api/projects`: Create a project (Requires `leader` role).
  ```json
  {
    "title": { "en": "New Project", "ar": "مشروع جديد" },
    "startDate": "2026-10-20",
    "endDate": "2026-12-31",
    "status": "planning",
    "teamMembers": ["usr-1", "usr-2"],
    "color": "#2563eb"
  }
  ```
- `GET /api/projects/:id`: Get project by ID.
- `PUT /api/projects/:id`: Update project.
- `DELETE /api/projects/:id`: Delete project (Cascades to sections and tasks).

---

<a id="sections-api"></a>

## Sections API

- `GET /api/sections`: List sections.
- `POST /api/sections`: Create Kanban column.
  ```json
  {
    "projectId": "prj-1",
    "title": { "en": "In Review", "ar": "قيد المراجعة" },
    "order": 2
  }
  ```
- `PUT /api/sections/reorder`: Reorder sections on Kanban board.

---

<a id="tasks-api"></a>

## Tasks API

- `GET /api/tasks`: List tasks.
- `POST /api/tasks`: Create task.
  ```json
  {
    "sectionId": "sec-1",
    "title": { "en": "Task Title", "ar": "عنوان المهمة" },
    "description": { "en": "<p>Content</p>", "ar": "<p>المحتوى</p>" },
    "status": "todo",
    "priority": "high",
    "assignedTo": ["usr-1"],
    "dueDate": "2026-11-01",
    "tags": ["Bug", "Frontend"],
    "assigneePrices": [{ "userId": "usr-1", "price": 500 }]
  }
  ```
- `PUT /api/tasks/:id`: Update task attributes.
- `PUT /api/tasks/reorder`: Reorder task positions and section slots.
- `POST /api/tasks/:id/image`: Upload private image attachment (multipart form).

---

<a id="users-api"></a>

## Users API

- `GET /api/users`: List team members.
- `POST /api/users`: Create user (Leader only).
- `PUT /api/users/:id`: Update user profile and password.
- `DELETE /api/users/:id`: Delete user.
- `PUT /api/users/reorder`: Reorder team hierarchy.

---

<a id="attachments-api"></a>

## Private Attachments (`GET /api/images/[...path]`)

Serves uploaded task attachments stored in the isolated `/uploads` volume. Unauthenticated requests are rejected with `401 Unauthorized` to prevent asset scraping.

---

<div align="center">

Built by <a href="https://github.com/shadow-x78">shadow-x78</a> ·
[Back to README](../README.md)

<sub>&copy; 2026 Taskboard (shadow-x78)</sub>

</div>
