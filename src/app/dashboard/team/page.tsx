import { redirect } from "next/navigation";

import { getSession } from "@/app/api/auth/utilsAuth";
import { TeamMembers } from "@/components/pages/teamPage";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <TeamMembers user={user} />;
}
