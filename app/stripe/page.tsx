export default function StripeLandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-700">✅ Stripe Checkout Complete</h1>
        <p>Thank you for subscribing! You now have full access to creator content.</p>
        <a href="/dashboard" className="text-blue-600 underline">Go to Dashboard</a>
      </div>
    </main>
  );
}
