import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = body.username;
    const price = Number(body.price);

    const session = await auth();

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!username || !price) {
      return new Response("Missing username or price", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { creatorProfile: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    if (!user.creatorProfile) {
      return new Response("Creator lane not selected", { status: 400 });
    }

    const classification = user.creatorProfile.classification;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        ...(classification === "NSFW"
          ? { nsfwPrice: price }
          : { sfwPrice: price }),
      },
    });

    await prisma.creator.upsert({
      where: { userId: user.id },
      update: {
        handle: username,
        classification,
        priceCents: price * 100,
      },
      create: {
        userId: user.id,
        handle: username,
        classification,
        priceCents: price * 100,
        currency: "USD",
        billingPeriodDays: 30,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Creator setup error:", error);
    return new Response("Server error", { status: 500 });
  }
}
