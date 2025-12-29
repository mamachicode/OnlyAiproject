'use client';

import { signOut, useSession } from "next-auth/react";

export default function AuthNav() {
  const { data: session } = useSession();

  return (
    <div className="fixed top-4 right-6 z-[9999] pointer-events-auto text-sm flex gap-3 text-black bg-white/90 backdrop-blur px-4 py-2 rounded shadow">
      {!session && (
        <>
          <a href="/create-account">Create Account</a>
          <a href="/login">Login</a>
        </>
      )}

      {session && (
        <>
          <a href="/dashboard">Dashboard</a>
          <button onClick={()=>signOut({ callbackUrl: "/" })} className="underline">
            Logout
          </button>
        </>
      )}
    </div>
  );
}
