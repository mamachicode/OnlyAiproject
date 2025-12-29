import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) return new Response("Missing", { status: 400 });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return new Response("Exists", { status: 400 });

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      username: email.split("@")[0],
      password: hash,
      sfwPrice: 10,
      nsfwPrice: 20,
      isNsfw: false
    }
  });

  return Response.json({ ok: true });
}
