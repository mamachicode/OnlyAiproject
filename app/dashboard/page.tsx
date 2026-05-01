// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      username: true,
      sfwPrice: true,
      isNsfw: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const creatorPath = `/public/creator/${user.username}`;

  const checklist = [
    {
      title: "Creator profile",
      status: user.username ? "Ready" : "Needs setup",
      href: "/dashboard/settings",
    },
    {
      title: "Subscription price",
      status: user.sfwPrice ? `$${user.sfwPrice}/month` : "Needs price",
      href: "/dashboard/settings",
    },
    {
      title: "First post",
      status: user._count.posts > 0 ? `${user._count.posts} post(s)` : "Upload needed",
      href: "/dashboard/upload",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl">
        <p className="text-sm font-semibold text-pink-300">OnlyAi creator system</p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Creator Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Set up your creator page, upload private posts, and prepare your page for paid subscribers.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {checklist.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
            >
              <p className="text-sm font-semibold text-zinc-500">{item.title}</p>
              <p className="mt-3 text-2xl font-black">{item.status}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-white/[0.03] p-6">
          <p className="text-sm font-semibold text-zinc-400">Your creator page</p>
          <h2 className="mt-2 text-2xl font-black">@{user.username}</h2>
          <p className="mt-2 text-zinc-400">{user.email}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={creatorPath}
              className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-center font-black text-white"
            >
              View public page
            </Link>

            <Link
              href="/dashboard/upload"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center font-black text-white hover:bg-white/10"
            >
              Upload a post
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
