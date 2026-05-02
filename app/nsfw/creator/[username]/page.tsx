import Link from "next/link";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function NsfwCreatorPage({ params }: PageProps) {
  const { username } = await params;
  const handle = decodeURIComponent(username);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-pink-300">
          NSFW lane disabled
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          This creator lane is not available yet.
        </h1>
        <p className="mt-4 text-zinc-300">
          OnlyAi currently supports SFW creator subscriptions through Stripe.
          NSFW subscriptions will stay disabled until the CCBill lane is
          approved, isolated, and enforced separately.
        </p>

        <Link
          href={`/public/creator/${handle}`}
          className="mt-8 inline-flex rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-400"
        >
          View SFW creator page
        </Link>
      </div>
    </main>
  );
}
