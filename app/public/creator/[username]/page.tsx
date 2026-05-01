// @ts-nocheck
export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/src/lib/prisma";

export default async function PublicCreatorPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const username = String(resolvedParams?.username || "").trim().toLowerCase();

  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      sfwPrice: true,
      posts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          caption: true,
          createdAt: true,
        },
      },
    },
  });

  if (!creator) {
    return (
      <main className="min-h-screen bg-[#07050d] text-white">
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-20">
          <Link href="/" className="mb-10 text-4xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>

          <h1 className="text-5xl font-black tracking-tight">
            Creator not found.
          </h1>

          <p className="mt-5 text-lg text-zinc-400">
            This creator page does not exist yet.
          </p>

          <Link
            href="/"
            className="mt-8 w-fit rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-black text-white"
          >
            Back to OnlyAi
          </Link>
        </section>
      </main>
    );
  }

  const price = creator.sfwPrice ?? 5;
  const posts = creator.posts || [];

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.28),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(147,51,234,0.28),_transparent_36%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-black tracking-tight">
              Only<span className="text-pink-400">Ai</span>
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-bold hover:bg-white/15"
            >
              Log in
            </Link>
          </nav>

          <div className="py-20">
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
              Creator membership
            </p>

            <h1 className="text-6xl font-black tracking-tight md:text-8xl">
              @{creator.username}
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-9 text-zinc-300">
              Subscribe to unlock private creator posts and member-only updates.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={`/subscribe/${creator.username}`}
                className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-center text-lg font-black text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.02]"
              >
                Subscribe for ${price}/month
              </Link>

              <p className="text-sm font-semibold text-zinc-500">
                Cancel anytime after launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-pink-300">Private feed</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Creator posts
            </h2>
          </div>

          <p className="text-sm font-semibold text-zinc-500">
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h3 className="text-2xl font-black">No posts yet</h3>
            <p className="mt-3 text-zinc-400">
              This creator has not uploaded posts yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
              >
                <div className="relative">
                  <img
                    src={post.url}
                    alt={post.caption || "OnlyAi creator post"}
                    className="h-80 w-full object-cover blur-sm brightness-75"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-white/15 bg-black/45 px-5 py-3 text-sm font-black backdrop-blur">
                      🔒 Subscribe to unlock
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-6 text-zinc-300">
                    {post.caption || "Members-only post"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
