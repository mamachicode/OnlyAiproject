export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
      <h1 className="text-4xl font-bold mb-4">✅ Subscription Successful!</h1>
      <p className="text-lg">Thank you for subscribing to OnlyAi.</p>
      <a href="/" className="mt-6 text-blue-600 underline">Go to homepage</a>
    </div>
  );
}

