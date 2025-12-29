import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { isNsfw } = await req.json();
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  await prisma.user.update({
    where: { email: session.user.email },
    data: { isNsfw }
  });

  return Response.json({ ok: true });
}
