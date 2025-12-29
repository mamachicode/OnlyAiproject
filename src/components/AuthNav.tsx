'use client';

import { signOut, useSession } from "next-auth/react";

export default function AuthNav() {
  const { data: session } = useSession();

  return (
    <div className="fixed top-0 left-0 w-full z-[2147483647] bg-red-600 text-white text-center py-3 font-bold">
      NAVBAR ACTIVE — SESSION = {session ? "LOGGED IN" : "LOGGED OUT"}
      {session && (
        <span className="ml-6 underline cursor-pointer" onClick={()=>signOut({ callbackUrl: "/" })}>
          LOGOUT
        </span>
      )}
    </div>
  );
}
