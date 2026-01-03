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
    <div className="p-10">
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>
      <p className="mt-4">
        Logged in as <strong>{session.user?.email}</strong>
      </p>
    </div>
  );
}
