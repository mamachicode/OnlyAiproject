import prisma from "@/lib/prisma"

export default async function NsfwPage() {
  const users = await prisma.user.findMany({
    include: {
      posts: {
        take: 1,
        where: { isNsfw: true },
        select: { imageUrl: true },
      },
    },
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {users.map((u) =>
        u.posts[0]?.imageUrl ? (
          <img
            key={u.id}
            src={u.posts[0].imageUrl}
            className="rounded shadow"
          />
        ) : null
      )}
    </div>
  )
}
