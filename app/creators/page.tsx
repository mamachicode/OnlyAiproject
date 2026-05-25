import Link from "next/link";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

function formatPrice(priceCents: number) {
  return (priceCents / 100).toFixed(2);
}

export default async function CreatorsPage() {
  const creators = await prisma.creator.findMany({
    where: {
      classification: "SFW",
      user: {
        posts: {
          some: {
            isNsfw: false,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        include: {
          posts: {
            where: {
              isNsfw: false,
            },
            select: {
              id: true,
              isLocked: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <nav className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-4xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/account"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              Account
            </Link>

            <Link
              href="/account/messages"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10 hover:text-white"
            >
              Messages
            </Link>
          </div>
        </nav>

        <div className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
            Find creators
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Discover creator pages
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Browse private memberships, exclusive posts, and creator updates.
          </p>
        </div>

        {creators.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.05] p-8">
            <h2 className="text-2xl font-black">No creator pages yet</h2>
            <p className="mt-3 text-zinc-400">
              Creator pages will appear here once they are ready.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => {
              const displayName = creator.displayName || creator.handle;
              const lockedCount = creator.user.posts.filter((post) => post.isLocked).length;
              const totalPosts = creator.user.posts.length;
              const price = formatPrice(creator.priceCents);

              return (
                <Link
                  key={creator.id}
                  href={`/public/creator/${creator.handle}`}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] transition hover:-translate-y-1 hover:border-pink-300/40 hover:bg-white/[0.08]"
                >
                  <div className="h-32 bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-black">
                    {creator.bannerUrl ? (
                      <img
                        src={creator.bannerUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="-mt-12 h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-[#120611] bg-gradient-to-br from-pink-500 to-purple-600">
                        {creator.avatarUrl ? (
                          <img
                            src={creator.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="min-w-0 pt-1">
                        <h2 className="truncate text-2xl font-black">
                          {displayName}
                        </h2>
                        <p className="mt-1 truncate text-sm text-zinc-500">
                          @{creator.handle}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-400">
                      {creator.bio ||
                        "Private creator posts, member updates, and exclusive drops."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-zinc-300">
                        {totalPosts} posts
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-zinc-300">
                        {lockedCount} member posts
                      </span>
                      <span className="rounded-full border border-pink-300/20 bg-pink-500/10 px-3 py-1 text-xs font-black text-pink-100">
                        ${price}/month
                      </span>
                    </div>

                    <div className="mt-6 rounded-full bg-white px-5 py-3 text-center text-sm font-black text-black group-hover:bg-pink-200">
                      View creator page
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
