export default function CCBillFailurePage() {
  return (
    <div className="p-10 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-red-600">Payment Failed ❌</h1>
      <p>Your payment could not be processed. Please try again or use a different payment method.</p>

      <a
        href="/"
        className="inline-block mt-6 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-900"
      >
        Return Home
      </a>
    </div>
  );
}
