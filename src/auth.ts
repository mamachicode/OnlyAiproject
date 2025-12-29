import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function auth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  const exists = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!exists) return null;

  return session;
}

export async function getServerAuthSession() {
  return auth();
}

