export default function CCBillSuccessPage() {
  return (
    <div className="p-10 max-w-2xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful 🎉</h1>
      <p>Your subscription is now active. Thank you for supporting your creator!</p>

      <a
        href="/dashboard"
        className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
