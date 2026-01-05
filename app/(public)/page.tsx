import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative z-0">
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to OnlyAI
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          AI-powered creator platform for adults.
        </p>

        {session ? (
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-green-600 text-white rounded"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            Sign In
          </Link>
        )}
      </main>
    </div>
  );
}
