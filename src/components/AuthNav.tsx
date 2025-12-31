'use client';

import { signOut, useSession } from "next-auth/react";

export default function AuthNav() {
  const { data: session } = useSession();

  return (
    <div className="fixed top-2 right-4 z-[2147483647] pointer-events-auto text-sm flex gap-3 text-black bg-white/95 backdrop-blur px-4 py-2 rounded shadow border">
      {!session && (
        <>
          <a href="/create-account">Create Account</a>
          <a href="/login">Login</a>
        </>
      )}

      {session && (
        <>
          <a href="/creator">Dashboard</a>
          <button onClick={()=>signOut({ callbackUrl: "/" })} className="underline">
            Logout
          </button>
        </>
      )}
    </div>
  );
}
