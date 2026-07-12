import { notFound, redirect } from "next/navigation";
import { auth } from "@/src/auth";

function adminEmails() {
  return String(process.env.ONLYAI_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdminPage(callbackUrl = "/admin") {
  const session = await auth();

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const email = String(session.user.email).trim().toLowerCase();

  if (!adminEmails().includes(email)) {
    notFound();
  }

  return {
    session,
    email,
    userId: session.user.id,
  };
}
