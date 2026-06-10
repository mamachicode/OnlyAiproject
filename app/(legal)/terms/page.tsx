export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-300">
            OnlyAi
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-zinc-400">
            These terms explain the basic rules for using OnlyAi creator memberships,
            creator pages, subscriptions, private posts, and fan accounts.
          </p>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-xl font-black text-white">1. Accounts</h2>
            <p className="mt-2">
              You are responsible for your account, login information, and activity on the platform.
              You may not impersonate others, abuse the service, or interfere with other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">2. Creator content</h2>
            <p className="mt-2">
              Creators are responsible for the posts, images, captions, profile information, and messages
              they publish. Content may be removed if it is harmful, illegal, abusive, unsafe, or violates
              platform rules.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">3. Subscriptions</h2>
            <p className="mt-2">
              Fans may subscribe to creator pages for monthly access to private posts and creator updates.
              Access remains active while the subscription is valid.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">4. Payments and refunds</h2>
            <p className="mt-2">
              Subscription payments are processed by secure third-party checkout providers. Refund requests
              are reviewed case by case. Creators cannot directly issue billing refunds from their page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">5. Account actions</h2>
            <p className="mt-2">
              We may limit, suspend, or remove accounts that violate platform rules, abuse the service,
              or create safety, security, or billing risks.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
