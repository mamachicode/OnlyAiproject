import Link from "next/link";

export default function HomePage() {
  const features = [
    "SFW-first MVP",
    "Creator subscriptions",
    "Moderated uploads",
    "Secure creator dashboard",
  ];

  const steps = [
    {
      title: "Create your creator profile",
      text: "Set up your public creator identity, bio, lane, and membership pricing.",
    },
    {
      title: "Upload approved content",
      text: "Publish clean, moderated content through a safe creator workflow.",
    },
    {
      title: "Set monthly access",
      text: "Choose your membership price and prepare your creator page for subscribers.",
    },
    {
      title: "Grow your private world",
      text: "Build a premium AI-powered feed as your audience grows.",
    },
  ];

  const platformPreview = [
    ["Creator profile", "Ready"],
    ["Upload moderation", "Active"],
    ["Membership pricing", "Built in"],
    ["Subscriber access", "Protected"],
  ];

  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.30),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(147,51,234,0.32),_transparent_36%),linear-gradient(to_bottom,_rgba(255,255,255,0.04),_transparent)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight">
              Only<span className="text-pink-400">AI</span>
            </Link>

            <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
              <Link href="/login" className="hover:text-white">
                Login
              </Link>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
              <a href="#launch" className="hover:text-white">
                Launch
              </a>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-14 py-20 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 shadow-2xl backdrop-blur">
                Premium AI creator subscriptions
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                Monetize your{" "}
                <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                  AI-powered
                </span>{" "}
                creator world.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                OnlyAI helps creators publish approved content, build private
                memberships, and prepare a premium subscription page without
                exposing sensitive content on the public homepage.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-7 py-4 text-center font-bold text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.02]"
                >
                  Start as Creator
                </Link>

                <a
                  href="#launch"
                  className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/10"
                >
                  See Platform
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300"
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-pink-500/20 to-purple-600/20 blur-3xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
                <div className="rounded-[1.5rem] bg-[#11101a] p-5">
                  <div className="mb-6">
                    <p className="text-sm text-zinc-400">Platform preview</p>
                    <p className="mt-1 text-3xl font-black">
                      Creator launch system
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      No fake creators. No fake earnings. The public directory
                      opens once real creator pages are ready.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {platformPreview.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-zinc-300">{label}</span>
                          <span className="font-bold text-white">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4">
                    <p className="text-sm font-bold text-pink-200">
                      Stripe-safe public homepage
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-300">
                      SFW-first messaging. Sensitive lanes remain gated and
                      separate from public marketing pages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-10 text-center text-xs uppercase tracking-[0.3em] text-zinc-500">
            Built for creators who want premium recurring revenue
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-pink-400">
            How it works
          </p>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            From creator profile to paid membership.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-lg font-black">
                {index + 1}
              </div>
              <h3 className="text-xl font-black">{step.title}</h3>
              <p className="mt-3 leading-7 text-zinc-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-pink-400">
                Creator directory
              </p>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                Real creator pages coming soon.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-zinc-300">
                The creator showcase will stay hidden until real creator
                profiles are live. This keeps the homepage honest, premium, and
                focused on the platform instead of fake demo accounts.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200"
              >
                Create first creator page
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-pink-400">
                Monetization
              </p>
              <h2 className="text-4xl font-black tracking-tight md:text-5xl">
                Monthly memberships for safe creator content.
              </h2>
            </div>

            <p className="text-lg leading-8 text-zinc-300">
              OnlyAI is designed for creator subscriptions, private feeds, and
              moderated uploads. The public MVP stays SFW-first for payment
              safety while advanced content lanes remain gated and separate.
            </p>
          </div>
        </div>
      </section>

      <section id="launch" className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-pink-400/20 bg-pink-500/10 p-10 text-center">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Launch your creator page today.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Build a premium AI creator world, publish safely, and prepare your
            subscription page for real paying subscribers.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-black text-white shadow-2xl shadow-pink-500/20"
          >
            Start as Creator
          </Link>
        </div>
      </section>
    </main>
  );
}
