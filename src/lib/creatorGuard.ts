// @ts-nocheck
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { auth, authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

export async function requireCreatorPage(callbackUrl = "/dashboard") {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creator: true },
  });

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (!user.creator) {
    redirect("/account");
  }

  return {
    user,
    creator: user.creator,
    userId: user.id,
    creatorId: user.creator.id,
  };
}

export async function getCreatorForApi() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return {
      ok: false,
      status: 401,
      error: "Login required.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { creator: true },
  });

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: "Login required.",
    };
  }

  if (!user.creator) {
    return {
      ok: false,
      status: 403,
      error: "Creator account required.",
    };
  }

  return {
    ok: true,
    user,
    creator: user.creator,
    userId: user.id,
    creatorId: user.creator.id,
  };
}
