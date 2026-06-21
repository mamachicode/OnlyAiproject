import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-300">
            OnlyAi support
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Contact OnlyAi
          </h1>
          <p className="mt-4 text-zinc-400">
            Need help with checkout, login, subscriptions, locked posts, or your creator page?
            Contact OnlyAi support here.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <h2 className="text-xl font-black text-white">Support email</h2>
          <p className="mt-3 text-lg font-black text-pink-200">
            support@weareonlyai.com
          </p>
          <p className="mt-4">
            Include the email used for your account, the creator page involved if relevant,
            and a clear description of the issue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-pink-400/20 bg-pink-500/10 p-5">
            <h2 className="text-lg font-black text-white">Fan support</h2>
            <p className="mt-3 text-sm leading-6 text-pink-100/80">
              Contact us if checkout failed, your subscription did not unlock posts,
              you cannot log in, or you need help canceling.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-black text-white">Creator support</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Contact us if you need help with your creator profile, uploads,
              posts, pricing, or subscriber access.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-5 text-sm leading-6 text-zinc-400">
          <p className="font-bold text-white">Creator messages vs support</p>
          <p className="mt-2">
            Message the creator for content questions. Contact OnlyAi support for payment,
            account, checkout, subscription, or unlock problems.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
        >
          ← Back to OnlyAi
        </Link>
      </section>
    </main>
  );
}
