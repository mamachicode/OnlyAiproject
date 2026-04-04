// @ts-nocheck
import prisma from "@/src/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function Page({ params }) {
  const creator = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      posts: true,
    },
  });

  if (!creator) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Creator not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{creator.username}</h1>
      <p className="text-gray-500 mb-6">Creator Profile</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {creator.posts.map((post) => (
          <div key={post.id} className="rounded overflow-hidden shadow bg-black/30">
            <Image
              src={post.url}
              alt="Post Image"
              width={400}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
