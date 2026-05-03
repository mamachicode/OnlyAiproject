import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";

type SettingsPageProps = {
  searchParams?: Promise<{
    saved?: string;
  }>;
};

function cleanHandle(value: FormDataEntryValue | null) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

function cleanPrice(value: FormDataEntryValue | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return 5;

  const rounded = Math.round(parsed);

  if (rounded < 1) return 1;
  if (rounded > 500) return 500;

  return rounded;
}

export default async function CreatorSettingsPage({
  searchParams,
}: SettingsPageProps) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect("/login");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const saved = resolvedSearchParams?.saved === "1";

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      sfwPrice: true,
      creator: {
        select: {
          handle: true,
          priceCents: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const currentHandle = user.creator?.handle || user.username || "";
  const currentMonthlyPrice =
    user.creator?.priceCents != null
      ? Math.round(user.creator.priceCents / 100)
      : user.sfwPrice ?? 5;

  async function saveCreatorSettings(formData: FormData) {
    "use server";

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;

    if (!userId) {
      redirect("/login");
    }

    const handle = cleanHandle(formData.get("handle"));
    const sfwPrice = cleanPrice(formData.get("sfwPrice"));
    const priceCents = sfwPrice * 100;

    if (!handle) {
      redirect("/dashboard/settings?error=handle");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: handle,
          sfwPrice,
        },
      }),

      prisma.creator.upsert({
        where: {
          userId,
        },
        update: {
          handle,
          displayName: handle,
          classification: "SFW",
          priceCents,
          currency: "USD",
          billingPeriodDays: 30,
        },
        create: {
          userId,
          handle,
          displayName: handle,
          classification: "SFW",
          priceCents,
          currency: "USD",
          billingPeriodDays: 30,
        },
      }),
    ]);

    redirect("/dashboard/settings?saved=1");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-pink-300">
          Creator onboarding
        </p>

        <h1 className="mt-4 text-4xl font-black">Creator settings</h1>

        <p className="mt-4 text-zinc-400">
          Set your creator handle and monthly subscription price.
        </p>

        {saved ? (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-sm font-semibold text-green-200">
            Settings saved.
          </div>
        ) : null}

        <form
          action={saveCreatorSettings}
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8"
        >
          <label className="block">
            <span className="text-sm font-bold text-zinc-100">
              Creator handle
            </span>

            <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/30 px-5">
              <span className="text-zinc-500">@</span>
              <input
                name="handle"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                defaultValue={currentHandle}
                className="w-full bg-transparent px-4 py-5 font-semibold text-white outline-none"
              />
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Your public page will use this handle.
            </p>
          </label>

          <label className="mt-8 block">
            <span className="text-sm font-bold text-zinc-100">
              Monthly price
            </span>

            <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/30 px-5">
              <span className="text-zinc-500">$</span>
              <input
                name="sfwPrice"
                required
                min={1}
                max={500}
                type="number"
                defaultValue={currentMonthlyPrice}
                className="w-full bg-transparent px-4 py-5 font-semibold text-white outline-none"
              />
              <span className="text-zinc-500">/month</span>
            </div>
          </label>

          <button
            type="submit"
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-5 text-lg font-black text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.01]"
          >
            Save creator settings
          </button>
        </form>
      </div>
    </main>
  );
}
