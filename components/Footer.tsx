import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07050d] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight">
            Only<span className="text-pink-400">Ai</span>
          </Link>
          <p className="mt-2 text-sm text-zinc-500">
            Private creator memberships.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-zinc-500">
          <Link href="/terms" className="hover:text-pink-300">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-pink-300">
            Privacy
          </Link>
          <Link href="/refund" className="hover:text-pink-300">
            Refunds
          </Link>
          <Link href="/contact" className="hover:text-pink-300">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
