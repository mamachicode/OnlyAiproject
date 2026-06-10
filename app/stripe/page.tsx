import { redirect } from "next/navigation";

export default function LegacyStripeRedirectPage() {
  redirect("/account");
}
