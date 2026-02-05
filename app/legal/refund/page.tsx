export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">Refund Policy</h1>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">General Rule</h2>
        <p>
          Subscription fees are generally non-refundable once a subscription period has started. This includes partial
          periods, unused time, accidental purchases, or dissatisfaction with content. Subscriptions can be canceled at
          any time to stop future renewals.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Billing Errors / Unauthorized Charges</h2>
        <p>
          If you believe there is a billing error or an unauthorized charge, contact support as soon as possible with your
          account email and any relevant billing details. We will investigate and respond promptly. If a refund is approved,
          it will be processed in accordance with our payment processor’s policies and timelines.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Chargebacks</h2>
        <p>
          Filing a chargeback without first contacting support may result in account restrictions or termination.
          We encourage users to contact support so we can resolve billing issues quickly and fairly.
        </p>
      </section>

      <p className="text-sm text-gray-600">
        Need help? Contact support via the Contact page.
      </p>
    </div>
  );
}
