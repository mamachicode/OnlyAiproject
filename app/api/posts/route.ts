import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"
import { hasActiveSubscription } from "@/lib/entitlement"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!currentUser) {
    return new Response("User not found", { status: 404 })
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 300 // 5 minutes

  const posts = await prisma.post.findMany({
    include: {
      media: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const transformed = await Promise.all(
    posts.map(async (post) => {
      const entitled = await hasActiveSubscription(
        currentUser.id,
        post.authorId
      )

      return {
        ...post,
        media: post.media.map((m) => {
          if (post.isLocked && !entitled) {
            return {
              type: m.type,
              order: m.order,
              url: m.blurUrl ?? null,
              locked: true,
            }
          }

          const signedUrl =
            m.publicId
              ? cloudinary.url(m.publicId, {
                  secure: true,
                  sign_url: true,
                  expires_at: expiresAt,
                })
              : m.url

          return {
            type: m.type,
            order: m.order,
            url: signedUrl,
            locked: false,
          }
        }),
      }
    })
  )

  return Response.json(transformed)
}
