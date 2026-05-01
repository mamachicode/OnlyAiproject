// @ts-nocheck
import { redirect } from "next/navigation";

export default async function SfwCreatorRedirect({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const username = String(resolvedParams?.username || "").trim().toLowerCase();

  redirect(`/public/creator/${username}`);
}
