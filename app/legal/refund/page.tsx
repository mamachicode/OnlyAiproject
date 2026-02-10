export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">Refund Policy</h1>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Recurring Subscriptions</h2>
        <p>
          By purchasing a subscription, you authorize recurring billing at the price and billing interval selected at
          checkout. Subscriptions automatically renew at the end of each billing period unless canceled prior to renewal.
        </p>
        <p>
          Charges occur at the beginning of each billing cycle. Access to content remains active until the end of the
          current paid period after cancellation.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Cancellation</h2>
        <p>
          You may cancel your subscription at any time through the applicable payment processor’s support portal (e.g., CCBill for adult subscriptions) or by contacting support. Cancellation stops future renewals but does not retroactively refund the current billing period.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Refunds</h2>
        <p>
          Subscription fees are generally non-refundable once a billing period has started. This includes partial periods,
          unused time, accidental purchases, or dissatisfaction with content.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Billing Errors / Unauthorized Charges</h2>
        <p>
          If you believe there is a billing error or an unauthorized charge, please contact support promptly with your
          account email and relevant billing details. We will investigate and respond in a timely manner. If a refund is
          approved, it will be processed in accordance with our payment processor’s policies and timelines.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Chargebacks</h2>
        <p>
          We strongly encourage customers to contact support before initiating a chargeback so we can resolve billing concerns directly. Chargebacks may result in account suspension or termination in accordance with payment processor requirements.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Billing Descriptor</h2>
        <p>
          Charges will appear on your billing statement using the descriptor provided by our payment processor.
        </p>
      </section>

      <p className="text-sm text-gray-600">
        For assistance, please visit the Contact page.
      </p>
    </div>
  );
}
