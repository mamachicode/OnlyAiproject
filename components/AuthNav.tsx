import Link from "next/link";

export default function AuthNav() {
  return (
    <header className="w-full border-b border-neutral-800 bg-black">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-white">
          OnlyAi
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-neutral-300 hover:text-white transition"
          >
            Login
          </Link>

          <Link
            href="/create-account"
            className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:opacity-90 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    </header>
  );
}
