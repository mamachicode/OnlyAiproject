"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10 hover:text-white"
    >
      Log out
    </button>
  );
}
