import Link from "next/link";

export default function NsfwPage() {
  return (
    <main className="min-h-screen bg-[#07050d] text-white">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-20">
        <Link href="/" className="mb-10 text-4xl font-black tracking-tight">
          Only<span className="text-pink-400">Ai</span>
        </Link>

        <p className="mb-5 inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
          Advanced creator lane
        </p>

        <h1 className="text-5xl font-black tracking-tight md:text-7xl">
          Not open yet.
        </h1>

        <p className="mt-6 max-w-2xl text-xl leading-9 text-zinc-300">
          OnlyAi is launching first with clean creator memberships. Advanced
          content lanes will open only after dedicated billing and compliance
          systems are ready.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 text-center text-lg font-black text-white shadow-2xl shadow-pink-500/20"
          >
            Back to OnlyAi
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-black text-white hover:bg-white/10"
          >
            Creator login
          </Link>
        </div>
      </section>
    </main>
  );
}
