// @ts-nocheck
import { redirect } from "next/navigation";

export default async function SfwSubscribeRedirect({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const username = String(resolvedParams?.username || "").trim().toLowerCase();

  redirect(`/subscribe/${username}`);
}
