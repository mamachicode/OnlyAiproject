import { redirect } from "next/navigation";

export default function LegacyCreatorDashboardRedirectPage() {
  redirect("/dashboard");
}
