export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-300">
            OnlyAi
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-zinc-400">
            This page explains the basic information OnlyAi uses to operate accounts,
            creator pages, subscriptions, uploads, and platform safety.
          </p>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-xl font-black text-white">1. Information we collect</h2>
            <p className="mt-2">
              We collect account information such as email, username, login data, creator profile details,
              posts, uploads, messages, and subscription metadata needed to run the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">2. Payments</h2>
            <p className="mt-2">
              Payment details are handled by secure third-party checkout providers. OnlyAi does not store
              full credit card numbers on its servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">3. Cookies and sessions</h2>
            <p className="mt-2">
              We use cookies and session data to keep users logged in, protect accounts, and personalize
              the experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">4. Sharing</h2>
            <p className="mt-2">
              We do not sell personal information. Limited information may be shared with service providers
              that help us operate hosting, authentication, payments, moderation, analytics, and support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">5. Contact</h2>
            <p className="mt-2">
              For privacy questions, contact support using the contact page.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
