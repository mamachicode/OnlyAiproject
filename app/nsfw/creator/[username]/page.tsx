import Link from "next/link";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function CreatorUnavailablePage({ params }: PageProps) {
  const { username } = await params;
  const handle = decodeURIComponent(username);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-pink-300">
          Creator page
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          This page is not available yet.
        </h1>
        <p className="mt-4 text-zinc-300">
          Please visit the creator’s main page for available subscription options.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/public/creator/${handle}`}
            className="inline-flex rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-400"
          >
            View creator page
          </Link>
        </div>
      </div>
    </main>
  );
}
