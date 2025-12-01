import Link from "next/link";
import { auth } from "@/src/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) return <div className="p-10 text-red-600">Not logged in</div>;

  return (
    <div className="flex">
      <aside className="w-64 p-6 border-r min-h-screen space-y-4">
        <h2 className="text-xl font-bold mb-4">OnlyAI Creator</h2>
        <nav className="space-y-3">
          <Link className="block" href="/dashboard">🏠 Overview</Link>
          <Link className="block" href="/dashboard/upload">📤 Upload</Link>
          <Link className="block" href="/dashboard/posts">🖼 Your Posts</Link>
          <Link className="block" href="/dashboard/settings">💵 Subscription Price</Link>
          <Link className="block" href="/dashboard/subscribers">📚 Subscribers</Link>
        </nav>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
