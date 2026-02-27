import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, price } = await req.json();
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Update user basic info
  await prisma.user.update({
    where: { id: user.id },
    data: {
      username,
      ...(user.isNsfw
        ? { nsfwPrice: price }
        : { sfwPrice: price }),
    },
  });

  // Check if creator profile already exists
  const existingCreator = await prisma.creator.findUnique({
    where: { userId: user.id },
  });

  const classification = user.isNsfw ? "NSFW" : "SFW";

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
}
