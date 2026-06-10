export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-300">
            OnlyAi
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Contact
          </h1>
          <p className="mt-4 text-zinc-400">
            Contact OnlyAi for account, billing, creator page, subscription, or safety questions.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <h2 className="text-xl font-black text-white">Support email</h2>
          <p className="mt-3 text-lg font-black text-pink-200">
            support@onlyai.com
          </p>
          <p className="mt-4">
            Include the email used for your account, the creator page involved if relevant,
            and a clear description of the issue.
          </p>
        </div>
      </section>
    </main>
  );
}
