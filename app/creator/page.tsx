import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="p-10 text-red-600">
        Not logged in
      </div>
    );
  }

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Creator Dashboard</h1>

      <p>
        Logged in as <strong>{session.user?.email}</strong>
      </p>

      <div className="grid grid-cols-1 gap-4 mt-6">
        <Link href="/creator/upload">
          <button className="w-full bg-black text-white py-3 rounded">
            Create Post
          </button>
        </Link>

        <Link href="/creator/posts">
          <button className="w-full border py-3 rounded">
            View My Posts
          </button>
        </Link>

        <Link href="/creator/subscribers">
          <button className="w-full border py-3 rounded">
            View Subscribers
          </button>
        </Link>

        <Link href="/creator/subscriptions">
          <button className="w-full border py-3 rounded">
            My Subscriptions
          </button>
        </Link>

        <Link href="/creator/settings">
          <button className="w-full border py-3 rounded">
            Account Settings
          </button>
        </Link>
      </div>
    </div>
  );
}
