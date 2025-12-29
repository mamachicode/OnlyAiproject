import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { username, price } = await req.json();
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  await prisma.user.update({
    where: { email: session.user.email },
    data: user?.isNsfw
      ? { username, nsfwPrice: price }
      : { username, sfwPrice: price }
  });

  return Response.json({ ok: true });
}
