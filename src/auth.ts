import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";

/**
 * Canonical OnlyAI App Router Auth
 * auth() is the primary helper used by API routes & server components
 */
export function auth() {
  return getServerSession(authOptions);
}

/**
 * Backwards-compatible alias (used by some server layouts)
 */
export function getServerAuthSession() {
  return getServerSession(authOptions);
}
