// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const username = session.user.username || session.user.name || "creator";
  const creatorPath = `/public/creator/${username}`;

  const cards = [
    {
      title: "Creator settings",
      detail: "Set your handle and monthly price.",
      href: "/dashboard/settings",
    },
    {
      title: "Upload post",
      detail: "Add your first private creator post.",
      href: "/dashboard/upload",
    },
    {
      title: "Your posts",
      detail: "Review your uploaded creator content.",
      href: "/dashboard/posts",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl">
        <p className="text-sm font-semibold text-pink-300">
          OnlyAi creator system
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Creator Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Welcome back, @{username}. Set up your creator page, upload posts,
          and prepare your membership for subscribers.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {cards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
            >
              <p className="text-2xl font-black">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {item.detail}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-white/[0.03] p-6">
          <p className="text-sm font-semibold text-zinc-400">
            Your creator page
          </p>

          <h2 className="mt-2 text-2xl font-black">@{username}</h2>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/settings"
              className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-center font-black text-white"
            >
              Finish setup
            </Link>

            <Link
              href={creatorPath}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-center font-black text-white hover:bg-white/10"
            >
              View public page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
