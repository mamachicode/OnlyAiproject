"use client";

import { usePathname } from "next/navigation";

export default function AgeBanner() {
  const pathname = usePathname();
  const isNsfwRoute = pathname?.startsWith("/nsfw");

  if (!isNsfwRoute) {
    return null;
  }

  return (
    <div className="w-full border-b border-red-500/20 bg-black px-4 py-3 text-center text-sm font-semibold text-white">
      18+ area — adults only
    </div>
  );
}
