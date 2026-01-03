export default function SubscriptionCancelledPage() {
  return (
    <div className="p-10 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-yellow-500">Subscription Cancelled</h1>
      <p>Your subscription is no longer active. You can reactivate at any time.</p>

      <a
        href="/"
        className="inline-block mt-6 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
      >
        Return Home
      </a>
    </div>
  );
}
