// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creator: true },
  });

  if (!user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const isCreator = Boolean(user.creator);

  const creatorUrl = user.creator?.handle
    ? `/public/creator/${user.creator.handle}`
    : "/dashboard/settings";

  return (
    <div className="min-h-screen bg-[#07050d] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-black/20 p-6 md:block">
          <Link href="/" className="text-3xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>

          <p className="mt-2 text-sm text-zinc-500">
            {isCreator ? "Creator dashboard" : "Fan account"}
          </p>

          {isCreator ? (
            <nav className="mt-10 space-y-2 text-sm font-semibold">
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/dashboard">
                Overview
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/dashboard/upload">
                Upload post
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/dashboard/posts">
                Your posts
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/dashboard/settings">
                Creator settings
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href={creatorUrl}>
                View creator page
              </Link>
            </nav>
          ) : (
            <nav className="mt-10 space-y-2 text-sm font-semibold">
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/dashboard">
                Fan home
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/account">
                My subscriptions
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white" href="/public/creator/demolitionbaby">
                View creator
              </Link>
              <Link className="block rounded-xl px-4 py-3 text-pink-200 hover:bg-pink-500/10 hover:text-white" href="/dashboard/settings">
                Become a creator
              </Link>
            </nav>
          )}
        </aside>

        <main className="flex-1">
          <div className="border-b border-white/10 bg-black/20 px-6 py-4 md:hidden">
            <Link href="/" className="text-2xl font-black">
              Only<span className="text-pink-400">Ai</span>
            </Link>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
