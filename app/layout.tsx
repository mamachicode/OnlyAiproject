import "./globals.css";
import type { Metadata } from "next";
import AgeBanner from "@/components/AgeBanner";
import Footer from "./footer";

export const metadata: Metadata = {
  title: "OnlyAI – AI Creator Platform",
  description: "AI-powered SFW & NSFW creator platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black min-h-screen flex flex-col">
        <AgeBanner />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
