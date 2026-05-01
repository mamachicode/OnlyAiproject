// @ts-nocheck
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";

function cleanUsername(value: FormDataEntryValue | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

function cleanPrice(value: FormDataEntryValue | null) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return 5;
  }

  return Math.min(99, Math.max(3, Math.round(price)));
}

export default async function SettingsPage({ searchParams }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await Promise.resolve(searchParams || {});
  const error = params.error;
  const saved = params.saved;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      sfwPrice: true,
      isNsfw: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  async function updateCreatorSettings(formData: FormData) {
    "use server";

    const serverSession = await auth();

    if (!serverSession?.user?.id) {
      redirect("/login");
    }

    const username = cleanUsername(formData.get("username"));
    const sfwPrice = cleanPrice(formData.get("sfwPrice"));

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      redirect("/dashboard/settings?error=username");
    }

    try {
      await prisma.user.update({
        where: { id: serverSession.user.id },
        data: {
          username,
          sfwPrice,
          isNsfw: false,
        },
      });
    } catch (err) {
      redirect("/dashboard/settings?error=taken");
    }

    redirect("/dashboard/settings?saved=1");
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-pink-300">Creator onboarding</p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Creator settings
        </h1>

        <p className="mt-4 text-zinc-400">
          Set your creator handle and monthly subscription price. SFW creator pages are enabled first.
        </p>

        {saved && (
          <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm font-semibold text-green-200">
            Settings saved.
          </div>
        )}

        {error === "username" && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
            Username must be 3–24 characters and can only use lowercase letters, numbers, and underscores.
          </div>
        )}

        {error === "taken" && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-semibold text-red-200">
            That username is already taken.
          </div>
        )}

        <form
          action={updateCreatorSettings}
          className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
        >
          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Creator handle
            </label>
            <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <span className="flex items-center px-4 font-black text-zinc-500">@</span>
              <input
                name="username"
                defaultValue={user.username}
                className="w-full bg-transparent px-4 py-4 text-white outline-none"
                placeholder="yourname"
                required
              />
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Your public page will use this handle.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300">
              Monthly price
            </label>
            <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <span className="flex items-center px-4 font-black text-zinc-500">$</span>
              <input
                type="number"
                name="sfwPrice"
                min="3"
                max="99"
                step="1"
                defaultValue={user.sfwPrice ?? 5}
                className="w-full bg-transparent px-4 py-4 text-white outline-none"
                required
              />
              <span className="flex items-center px-4 text-sm font-semibold text-zinc-500">
                /month
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-sm font-bold text-zinc-300">Advanced content lane</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Disabled for launch. OnlyAi will start with clean SFW creator memberships before adult billing/compliance is activated.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-pink-500/20"
          >
            Save creator settings
          </button>
        </form>
      </div>
    </div>
  );
}
