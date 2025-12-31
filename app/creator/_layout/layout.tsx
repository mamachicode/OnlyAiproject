export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-6xl mx-auto px-8 py-10">
      {children}
    </section>
  );
}
