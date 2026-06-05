import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MapExplorer } from "@/components/MapExplorer";
import { parseUserCookie } from "@/lib/auth";

export default async function MapPage() {
  const user = parseUserCookie(await cookies());

  if (!user) {
    redirect("/?auth=required");
  }

  return <MapExplorer />;
}
