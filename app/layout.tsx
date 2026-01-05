import AuthNav from "@/components/AuthNav";
import AgeBanner from "@/components/AgeBanner";
import Footer from "./(public)/footer";
import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./(public)/globals.css";

export const metadata: Metadata = {
  title: "OnlyAI",
  description: "AI Creator Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SessionProviderWrapper>
        <body className="bg-gray-50 text-black min-h-screen flex flex-col">
          <AgeBanner />
          <AuthNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </SessionProviderWrapper>
    </html>
  );
}
