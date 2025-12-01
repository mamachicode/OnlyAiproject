import "./globals.css";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import AgeBanner from "@/components/AgeBanner";

export const metadata: Metadata = {
  title: "OnlyAI – AI Creator Platform",
  description: "AI-powered SFW & NSFW creator platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black min-h-screen flex flex-col">

        {/* 18+ banner only for NSFW */}
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
