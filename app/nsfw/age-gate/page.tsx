import Link from "next/link";
import { requireAdminPage } from "@/src/lib/adminGuard";
import AgeGateActions from "./AgeGateActions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

function safeReturnTo(value: unknown) {
  const candidate = String(value || "").trim();

  if (
    !candidate.startsWith("/nsfw") ||
    candidate.startsWith("/nsfw/age-gate")
  ) {
    return "/nsfw";
  }

  return candidate;
}

export default async function NsfwAgeGatePage({
  searchParams,
}: PageProps) {
  await requireAdminPage("/nsfw/age-gate");

  const query = await searchParams;
  const returnTo = safeReturnTo(query?.returnTo);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(127,29,29,0.35),transparent_40%),linear-gradient(180deg,#17060a_0%,#080307_100%)] px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[75vh] max-w-xl items-center">
        <div className="w-full rounded-[2rem] border border-red-400/25 bg-black/70 p-7 shadow-2xl shadow-red-950/30 backdrop-blur sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-red-300">
            Adults only
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            You must be 18 or older
          </h1>

          <p className="mt-5 text-base leading-7 text-zinc-300">
            This private OnlyAi area contains adult material. By
            entering, you confirm that you are at least 18 years old
            and legally permitted to view adult content in your
            location.
          </p>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            Do not enter if you are under 18 or if adult content is
            prohibited where you live.
          </div>

          <AgeGateActions returnTo={returnTo} />

          <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-bold text-zinc-500">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>

            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>

            <Link href="/2257" className="hover:text-white">
              2257
            </Link>

            <Link
              href="/nsfw/prohibited-content"
              className="hover:text-white"
            >
              Prohibited content
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
