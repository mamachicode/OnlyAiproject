export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16 text-white">
      <section className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-pink-300">
            OnlyAi
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Refund Policy
          </h1>
          <p className="mt-4 text-zinc-400">
            This page explains how billing questions and refund requests are handled for creator memberships.
          </p>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-zinc-300">
          <section>
            <h2 className="text-xl font-black text-white">1. Monthly memberships</h2>
            <p className="mt-2">
              Creator memberships renew monthly until canceled. Access remains active while the subscription
              is valid.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">2. Refund requests</h2>
            <p className="mt-2">
              Refund requests are reviewed case by case. Approval may depend on billing status, access history,
              account activity, and the reason for the request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">3. Creator responsibility</h2>
            <p className="mt-2">
              Creators cannot directly issue refunds from their creator page. Fans should contact OnlyAi
              support for billing help.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">4. Billing issues</h2>
            <p className="mt-2">
              If you believe a charge was unauthorized or incorrect, contact support with the email used
              for the subscription and any relevant details.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
