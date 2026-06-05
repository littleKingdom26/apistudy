import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SubscriptionCheckout } from "@/components/SubscriptionCheckout";
import { parseUserCookie } from "@/lib/auth";

export default async function SubscribePage() {
  const user = parseUserCookie(await cookies());

  if (!user) {
    redirect("/?auth=required");
  }

  return <SubscriptionCheckout />;
}
