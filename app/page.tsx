import Link from "next/link";
import OnlyAiLogo, { NeonAi } from "@/components/OnlyAiLogo";

export default function HomePage() {
  const highlights = [
    "Private creator feeds",
    "Monthly subscriptions",
    "Exclusive posts",
    "Fan-only updates",
  ];

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.28),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(147,51,234,0.35),_transparent_36%),linear-gradient(to_bottom,_rgba(255,255,255,0.04),_transparent)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
          <nav className="flex items-center justify-between">
            <OnlyAiLogo size="md" showIcon={false} />

            <div className="flex items-center gap-5 text-sm font-semibold text-zinc-200 md:text-base">
              <Link href="/login" className="hover:text-pink-300">
                Log in
              </Link>

              <Link
                href="/signup"
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2 hover:bg-white/15"
              >
                Sign up
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-14 py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-5xl">
              <p className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                AI creator platform
              </p>

              <h1 className="text-6xl font-black leading-[0.95] tracking-tight md:text-6xl">
                Ai lovers,
                <br />
                creators, and fans.
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                   
                </span>
              </h1>

              <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-300 md:text-2xl">
                OnlyAi helps creators launch private subscription pages where
                fans unlock exclusive posts, drops, and creator updates.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-center text-lg font-black text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.02]"
                >
                  Start as a Creator
                </Link>

                <Link
                  href="/public/creator/demolitionbaby"
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white transition hover:bg-white/10"
                >
                  View Demo Creator
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

            <div className="relative hidden justify-end lg:flex">
              <div className="absolute -inset-8 rounded-full bg-pink-500/15 blur-3xl" />

              <div className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-pink-950/30 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-pink-300">
                      Preview
                    </p>
                    <h2 className="mt-1 text-2xl font-black">
                      Private post
                    </h2>
                  </div>

                  <div className="rounded-full border border-pink-300/20 bg-pink-400/10 px-4 py-2 text-sm font-black text-pink-200">
                    Locked
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-[#100816] p-4">
                  <div className="flex h-40 items-center justify-center rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-pink-500/35 via-purple-500/25 to-black">
                    <div className="rounded-full border border-white/15 bg-black/35 px-5 py-3 text-sm font-black backdrop-blur">
                      🔒 Subscribe to unlock
                    </div>
                  </div>

                  <p className="mt-5 text-sm font-semibold text-zinc-400">
                    Members-only access
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    Posts, drops, and updates
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Fans subscribe monthly to unlock private creator content.
                  </p>
                </div>

                <Link
                  href="/public/creator/demolitionbaby"
                  className="mt-4 block rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 text-center text-base font-black shadow-xl shadow-pink-500/20 hover:from-pink-400 hover:to-purple-500"
                >
                  Preview creator page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
