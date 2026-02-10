'use client';

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthNav() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b border-neutral-800 bg-black">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">

        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          OnlyAI
        </Link>

        <nav className="flex items-center gap-6 text-sm text-neutral-400">

          {!session && (
            <>
              <Link href="/create-account" className="hover:text-white transition">
                Create Account
              </Link>

              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:opacity-90 transition"
              >
                Login
              </Link>
            </>
          )}

          {session && (
            <>
              <Link href="/creator" className="hover:text-white transition">
                Dashboard
              </Link>

              <Link href="/billing/support" className="hover:text-white transition">
                Manage Subscription
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}

        </nav>
      </div>
    </header>
  );
}
