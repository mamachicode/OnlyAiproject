export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export default async function NsfwPage() {
  const hasCloudinaryConfig =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET

  const expiresAt = Math.floor(Date.now() / 1000) + 300 // 5 minutes

  const users = await prisma.user.findMany({
    include: {
      posts: {
        take: 1,
        where: { isNsfw: true },
        include: {
          media: {
            take: 1,
            orderBy: { order: "asc" },
          },
        },
      },
    },
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {users.map((u) => {
        const post = u.posts[0]
        const media = post?.media?.[0]
        if (!media) return null

        const displayUrl = post.isLocked
          ? media.blurUrl ?? null
          : media.publicId && hasCloudinaryConfig
            ? cloudinary.url(media.publicId, {
                secure: true,
                sign_url: true,
                expires_at: expiresAt,
              })
            : media.url

        if (!displayUrl) return null

        return media.type === "IMAGE" ? (
          <img
            key={u.id}
            src={displayUrl}
            className="rounded shadow"
          />
        ) : (
          <video
            key={u.id}
            src={displayUrl}
            className="rounded shadow"
            controls={!post.isLocked}
          />
        )
      })}
    </div>
  )
}
