import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { classification } = await req.json();

    if (classification !== "SFW" && classification !== "NSFW") {
      return new Response("Invalid classification", { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const handle = user.username || user.email.split("@")[0];

    await prisma.creator.upsert({
      where: { userId: user.id },
      update: {
        classification,
      },
      create: {
        userId: user.id,
        handle,
        classification,
        priceCents: 1000,
        currency: "USD",
        billingPeriodDays: 30,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Set lane error:", error);
    return new Response("Server error", { status: 500 });
  }
}
