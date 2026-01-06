import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { postId } = await req.json()

  await prisma.post.delete({
    where: { id: postId },
  })

  return new Response("OK", { status: 200 })
}
