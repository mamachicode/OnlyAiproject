export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">👋 Welcome to OnlyAI</h1>
        <p className="text-lg text-gray-600">
          Please <a href="/login" className="text-blue-600 underline">sign in</a> to access the dashboard
        </p>
      </div>
    </main>
  );
}
