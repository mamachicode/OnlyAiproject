import type { Metadata } from "next";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnlyAI",
  description: "AI-powered creator subscription platform for adults.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen flex flex-col">
        <SessionProviderWrapper>
          <div className="flex-1">
            {children}
          </div>

          <footer className="border-t border-neutral-800 text-neutral-400 text-sm py-6 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-4">
              <div>
                © 2026 OnlyAI. All rights reserved.
              </div>

              <div className="flex flex-wrap gap-4">
                <a href="/legal/terms" className="hover:text-white">Terms</a>
                <a href="/legal/privacy" className="hover:text-white">Privacy</a>
                <a href="/legal/refund" className="hover:text-white">Refund</a>
                <a href="/legal/2257" className="hover:text-white">2257</a>
                <a href="/billing/support" className="hover:text-white">Billing Support</a>
              </div>
            </div>
          </footer>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
