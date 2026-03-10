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
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const classification = user.isNsfw ? "NSFW" : "SFW";

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        ...(user.isNsfw
          ? { nsfwPrice: price }
          : { sfwPrice: price }),
      },
    });

    const existingCreator = await prisma.creator.findUnique({
      where: { userId: user.id },
    });

    if (!existingCreator) {
      await prisma.creator.create({
        data: {
          userId: user.id,
          handle: username,
          classification,
          priceCents: price * 100,
          currency: "USD",
          billingPeriodDays: 30,
        },
      });
    } else {
      await prisma.creator.update({
        where: { userId: user.id },
        data: {
          handle: username,
          classification,
          priceCents: price * 100,
        },
      });
    }

    return Response.json({ ok: true });

  } catch (error) {
    console.error("Creator setup error:", error);
    return new Response("Server error", { status: 500 });
  }
}
