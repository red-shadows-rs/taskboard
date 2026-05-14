import { redirect } from "next/navigation";

import { getSession } from "@/app/api/auth/utilsAuth";
import ProfilePage from "@/components/pages/profilePage";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <ProfilePage user={user} />;
}
