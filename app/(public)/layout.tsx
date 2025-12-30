import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import AuthNav from "@/components/AuthNav";
import AgeBanner from "@/components/AgeBanner";
import Footer from "./footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OnlyAI – AI Creator Platform",
  description: "AI-powered SFW & NSFW creator platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black min-h-screen flex flex-col">
        <SessionProviderWrapper>
          <AgeBanner />
          <AuthNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
