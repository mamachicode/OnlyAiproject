export default function SubscriptionActivePage() {
  return (
    <div className="p-10 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">Subscription Active</h1>
      <p>Your membership is active and your access is unlocked.</p>

      <a
        href="/creator"
        className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
