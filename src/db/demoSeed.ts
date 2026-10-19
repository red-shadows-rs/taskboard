// ─────────────────────────────────────────────
// Taskboard - Demo Sandbox Seed Dataset
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import type {
  NewUserRow,
  NewProjectRow,
  NewSectionRow,
  NewTaskRow,
} from "@/db/schema";

const DEMO_PW = "$2a$10$bQJsQnv4jyXMiBxgaj02GO9sa2QF0Mda0xFBIQ1NckFR10e8UgwuW";

export const DEMO_USERS: NewUserRow[] = [
  {
    id: "usr-demo-leader",
    name: "Demo Leader",
    email: "demo@red-shadows-rs.com",
    password: DEMO_PW,
    role: "leader",
    order: 0,
  },
  {
    id: "usr-sarah-otaibi",
    name: "سارة العتيبي (Sarah)",
    email: "sarah@example.com",
    password: DEMO_PW,
    role: "member",
    order: 1,
  },
  {
    id: "usr-alex-chen",
    name: "Alex Chen",
    email: "alex@example.com",
    password: DEMO_PW,
    role: "member",
    order: 2,
  },
  {
    id: "usr-apex-client",
    name: "Apex Global (Client)",
    email: "client@apex.example",
    password: DEMO_PW,
    role: "client",
    order: 3,
  },
];

export const DEMO_PROJECTS: NewProjectRow[] = [
  {
    id: "prj-cloud-mig",
    titleEn: "Enterprise Cloud Migration",
    titleAr: "ترحيل البنية التحتية السحابية للمؤسسة",
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    status: "active",
    teamMembers: JSON.stringify([
      "usr-demo-leader",
      "usr-sarah-otaibi",
      "usr-alex-chen",
    ]),
    color: "#2563eb",
    createdBy: "usr-demo-leader",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-15T12:00:00.000Z",
    order: 0,
  },
  {
    id: "prj-mobile-app",
    titleEn: "NextGen Mobile Banking",
    titleAr: "تطبيق الخدمات المصرفية الرقمية",
    startDate: "2026-09-15",
    endDate: "2026-12-15",
    status: "active",
    teamMembers: JSON.stringify(["usr-demo-leader", "usr-sarah-otaibi"]),
    color: "#059669",
    createdBy: "usr-demo-leader",
    createdAt: "2026-09-15T08:00:00.000Z",
    updatedAt: "2026-10-10T09:30:00.000Z",
    order: 1,
  },
];

export const DEMO_SECTIONS: NewSectionRow[] = [
  {
    id: "sec-backlog",
    projectId: "prj-cloud-mig",
    titleEn: "Backlog",
    titleAr: "قائمة الانتظار",
    order: 0,
  },
  {
    id: "sec-in-dev",
    projectId: "prj-cloud-mig",
    titleEn: "In Development",
    titleAr: "قيد التطوير",
    order: 1,
  },
  {
    id: "sec-review",
    projectId: "prj-cloud-mig",
    titleEn: "Review & QA",
    titleAr: "المراجعة وضمان الجودة",
    order: 2,
  },
  {
    id: "sec-done",
    projectId: "prj-cloud-mig",
    titleEn: "Done",
    titleAr: "المكتملة",
    order: 3,
  },
];

export const DEMO_TASKS: NewTaskRow[] = [
  {
    id: "tsk-arch-eval",
    sectionId: "sec-done",
    titleEn: "Evaluate Kubernetes clusters and topology",
    titleAr: "تقييم مجموعات كوبرنيتيس والهيكلية السحابية",
    descriptionEn:
      "<p>Complete benchmark evaluation across multi-region VPC architectures.</p>",
    descriptionAr:
      "<p>استكمال التقييم المعياري عبر معماريات الشبكات الافتراضية متعددة المناطق.</p>",
    status: "done",
    assignedTo: JSON.stringify(["usr-sarah-otaibi"]),
    dueDate: "2026-10-10",
    priority: "high",
    tags: JSON.stringify(["DevOps", "Infrastructure"]),
    order: 0,
    attachments: "[]",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-09T16:00:00.000Z",
    completedAt: "2026-10-09T16:00:00.000Z",
    assigneePrices: JSON.stringify([
      { userId: "usr-sarah-otaibi", price: 1200 },
    ]),
  },
  {
    id: "tsk-db-sharding",
    sectionId: "sec-in-dev",
    titleEn: "Implement SQLite WAL & replication pipeline",
    titleAr: "تنفيذ تسجيل المعاملات في وضع WAL وخط أنابيب النسخ",
    descriptionEn:
      "<p>Configure WAL mode checkpoints and immutable state triggers for zero-latency queries.</p>",
    descriptionAr:
      "<p>ضبط نقاط حفظ وضع WAL ومشغلات الحالة الثابتة للاستعلامات فائقة السرعة.</p>",
    status: "in_progress",
    assignedTo: JSON.stringify(["usr-alex-chen", "usr-sarah-otaibi"]),
    dueDate: "2026-10-25",
    priority: "urgent",
    tags: JSON.stringify(["Database", "Backend"]),
    order: 0,
    attachments: "[]",
    createdAt: "2026-10-11T09:00:00.000Z",
    updatedAt: "2026-10-18T14:20:00.000Z",
    assigneePrices: JSON.stringify([
      { userId: "usr-alex-chen", price: 1800 },
      { userId: "usr-sarah-otaibi", price: 950 },
    ]),
  },
  {
    id: "tsk-sec-audit",
    sectionId: "sec-review",
    titleEn: "Run automated security & penetration audit",
    titleAr: "تشغيل فحص الأمان الآلي واختبار الاختراق",
    descriptionEn:
      "<p>Ensure all endpoints enforce HMAC-SHA256 session signatures and rate limits.</p>",
    descriptionAr:
      "<p>التأكد من أن جميع المسارات تفرض توقيعات HMAC-SHA256 وحدود معدل الطلبات.</p>",
    status: "in_review",
    assignedTo: JSON.stringify(["usr-demo-leader"]),
    dueDate: "2026-10-28",
    priority: "high",
    tags: JSON.stringify(["Security", "Audit"]),
    order: 0,
    attachments: "[]",
    createdAt: "2026-10-14T11:30:00.000Z",
    updatedAt: "2026-10-19T08:15:00.000Z",
    assigneePrices: JSON.stringify([
      { userId: "usr-demo-leader", price: 2100 },
    ]),
  },
  {
    id: "tsk-rtl-export",
    sectionId: "sec-backlog",
    titleEn: "Side-by-side Arabic/English PDF report export",
    titleAr: "تصدير تقارير PDF ثنائية اللغة جنباً إلى جنب",
    descriptionEn:
      "<p>Implement mirrored Cairo font typography for project progress and task receipts.</p>",
    descriptionAr:
      "<p>تنفيذ طباعة خط القاهرة المتطابق لتقارير تقدم المشروع وإيصالات المهام.</p>",
    status: "todo",
    assignedTo: JSON.stringify(["usr-alex-chen"]),
    dueDate: "2026-11-05",
    priority: "medium",
    tags: JSON.stringify(["Reporting", "PDF"]),
    order: 0,
    attachments: "[]",
    createdAt: "2026-10-15T13:00:00.000Z",
    updatedAt: "2026-10-15T13:00:00.000Z",
    assigneePrices: JSON.stringify([{ userId: "usr-alex-chen", price: 750 }]),
  },
];
