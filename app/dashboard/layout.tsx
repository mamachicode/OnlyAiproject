import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
