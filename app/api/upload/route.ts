import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File
  const title = formData.get("title") as string | null
  const content = formData.get("content") as string | null
  const isNsfw = formData.get("isNsfw") === "true"

  if (!file || !title) return new Response("Missing fields", { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
      .end(buffer)
  })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) return new Response("User not found", { status: 404 })

  await prisma.post.create({
    data: {
      title,
      content,
      isNsfw,
      imageUrl: upload.secure_url,
      authorId: user.id,
    },
  })

  return new Response("OK", { status: 200 })
}
