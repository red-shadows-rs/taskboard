import { redirect } from "next/navigation";

import { getSession } from "@/app/api/auth/utilsAuth";
import AnalyticsPage from "@/components/pages/analyticsPage";

export const dynamic = "force-dynamic";

export default async function Analytics() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }
  if (user.role === "client") {
    redirect("/dashboard/projects");
  }
  return <AnalyticsPage user={user} />;
}
