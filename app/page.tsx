import Link from "next/link";

export default function HomePage() {
  const highlights = [
    "Creator pages",
    "Creator subscriptions",
    "Exclusive posts",
    "Gated access",
  ];

  const previewItems = [
    {
      label: "Private feed",
      title: "Exclusive creator posts",
      detail: "Members unlock more",
    },
    {
      label: "Locked access",
      title: "Subscribe to view",
      detail: "Gated for fans",
    },
    {
      label: "Membership",
      title: "Creator page access",
      detail: "Monthly subscription",
    },
  ];

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.28),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(147,51,234,0.35),_transparent_36%),linear-gradient(to_bottom,_rgba(255,255,255,0.04),_transparent)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-4xl font-black tracking-tight md:text-5xl">
              Only<span className="text-pink-400">Ai</span>
            </Link>

            <div className="flex items-center gap-5 text-sm font-semibold text-zinc-200 md:text-base">
              <Link href="/login" className="hover:text-pink-300">
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2 hover:bg-white/15"
              >
                Sign up
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-5xl">
              <p className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                Private creator memberships
              </p>

              <h1 className="text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
                Create.
                <br />
                Subscribe.
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                  Get closer.
                </span>
              </h1>

              <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-300 md:text-2xl">
                Create your private creator page. Share exclusive posts. Fans
                subscribe to unlock more.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-center text-lg font-black text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.02]"
                >
                  Become a Creator
                </Link>

                <Link
                  href="/login"
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
                >
                  Subscribe to a Creator
                </Link>
              </div>

              <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-zinc-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-10 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative ml-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-pink-950/40 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-pink-300">
                      Creator page preview
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      Private feed
                    </h2>
                  </div>

                  <div className="rounded-full border border-pink-300/20 bg-pink-400/10 px-4 py-2 text-sm font-black text-pink-200">
                    Members
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#11091a] p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.34),_transparent_45%)]" />

                  <div className="relative">
                    <div className="mb-5 h-44 rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-black">
                      <div className="flex h-full items-center justify-center">
                        <div className="rounded-full border border-white/20 bg-black/35 px-5 py-3 text-sm font-black backdrop-blur">
                          🔒 Subscribe to unlock
                        </div>
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-zinc-400">
                      Locked post
                    </p>
                    <h3 className="mt-1 text-2xl font-black">
                      Exclusive content for fans
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      A cleaner way for creators to share private posts with
                      subscribers.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {previewItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                          {item.label}
                        </p>
                        <p className="mt-1 font-black text-white">
                          {item.title}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-zinc-400">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 text-center text-base font-black shadow-xl shadow-pink-500/20">
                  Unlock the creator page
                </div>
              </div>
            </div>
          </div>

          <div className="pb-10 text-sm text-zinc-500">
            Public pages stay clean. Advanced content lanes stay gated until
            dedicated billing and compliance are ready.
          </div>
        </div>
      </section>
    </main>
  );
}
