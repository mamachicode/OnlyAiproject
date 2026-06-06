import Link from "next/link";

type BillingSuccessPageProps = {
  searchParams?: Promise<{
    creator?: string;
    session_id?: string;
  }>;
};

export default async function BillingSuccessPage({
  searchParams,
}: BillingSuccessPageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const creatorHandle = String(resolvedSearchParams?.creator || "").trim();

  const creatorHref = creatorHandle
    ? `/public/creator/${encodeURIComponent(creatorHandle)}`
    : "/account";

  return (
    <main className="min-h-screen bg-[#07050d] px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center">
        <div className="rounded-[2rem] border border-green-400/20 bg-gradient-to-br from-green-500/[0.16] via-white/[0.06] to-pink-500/[0.1] p-8 shadow-2xl shadow-green-950/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-400 text-3xl">
            ✅
          </div>

          <p className="mt-8 text-center text-sm font-black uppercase tracking-[0.28em] text-green-200">
            Payment successful
          </p>

          <h1 className="mt-4 text-center text-4xl font-black tracking-tight sm:text-5xl">
            Your membership is active.
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-center text-base leading-7 text-zinc-300">
            You can now return to the creator page and unlock member posts.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href={creatorHref}
              className="rounded-full bg-white px-6 py-4 text-center text-sm font-black text-black hover:bg-zinc-200"
            >
              Go to creator page
            </Link>

            <Link
              href="/account"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-black text-white hover:bg-white/10"
            >
              View account
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-zinc-500">
            Your subscription is managed securely. You can review supported creators from your account.
          </p>
        </div>
      </div>
    </main>
  );
}
