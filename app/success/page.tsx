import { redirect } from "next/navigation";

export default function LegacySuccessRedirectPage() {
  redirect("/account");
}
