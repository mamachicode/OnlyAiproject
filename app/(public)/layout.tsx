import AuthNav from "@/components/AuthNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNav />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}
