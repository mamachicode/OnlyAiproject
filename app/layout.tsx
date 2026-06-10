import "./globals.css";
import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import AgeBanner from "@/components/AgeBanner";

export const metadata: Metadata = {
  title: "OnlyAi – AI Creator Platform",
  description: "Private AI creator memberships, subscriptions, and fan-only posts.",
};

export const viewport: Viewport = {
  themeColor: "#07050d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#07050d]">
      <body className="min-h-dvh bg-[#07050d] text-white flex flex-col">

        {/* Optional route banner */}
        <AgeBanner />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global footer with legal links */}
        <Footer />

      </body>
    </html>
  );
}
