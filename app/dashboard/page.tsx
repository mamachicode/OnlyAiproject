import { auth } from "@/src/auth";

export default async function Dashboard() {
  const session = await auth();

  if (!session) return <div className="p-10 text-red-600">Not logged in</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Creator Dashboard</h1>
      <p>Welcome, {session.user?.email}</p>
      <p className="mt-2 text-gray-600">Use the left menu to manage your content.</p>
    </div>
  );
}
