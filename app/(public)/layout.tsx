import AuthNav from "@/components/AuthNav";
import AgeBanner from "@/components/AgeBanner";
import Footer from "./footer";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OnlyAI",
  description: "AI Creator Platform",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-black min-h-screen flex flex-col">
        <AgeBanner />
        <AuthNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
