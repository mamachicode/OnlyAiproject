// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const creatorUrl = session.user.username
    ? `/public/creator/${session.user.username}`
    : "/dashboard/settings";

  return (
    <div className="min-h-screen bg-[#07050d] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-black/20 p-6 md:block">
          <Link href="/" className="text-3xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>

          <p className="mt-2 text-sm text-zinc-500">Creator dashboard</p>

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
