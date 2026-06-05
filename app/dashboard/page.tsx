import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PublicDataExplorer } from "@/components/PublicDataExplorer";
import { parseUserCookie } from "@/lib/auth";

export default async function DashboardPage() {
  const user = parseUserCookie(await cookies());

  if (!user) {
    redirect("/?auth=required");
  }

  return <PublicDataExplorer user={user} />;
}
