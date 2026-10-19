// ─────────────────────────────────────────────
// Taskboard - App Layout
// https://github.com/red-shadows-rs/taskboard
// ─────────────────────────────────────────────

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/app/api/auth/utilsAuth";
import { DemoBanner } from "@/components/layouts/demoBannerLayout";
import { Footer } from "@/components/layouts/footerLayout";
import { Navbar } from "@/components/layouts/navbarLayout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const isDemo = cookieStore.get("taskboard_demo")?.value === "1";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isDemo && <DemoBanner />}
      <Navbar user={user} />
      {children}
      <Footer />
    </div>
  );
}
