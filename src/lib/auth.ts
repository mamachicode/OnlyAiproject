import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";

export function getAuthSession() {
  return getServerSession(authOptions);
}
