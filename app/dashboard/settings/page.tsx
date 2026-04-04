export const dynamic = "force-dynamic";
// @ts-nocheck
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      sfwPrice: true,
      nsfwPrice: true,
    },
  });

  async function updatePrices(formData: FormData) {
    "use server";

    const sfwPrice = Number(formData.get("sfwPrice"));
    const nsfwPrice = Number(formData.get("nsfwPrice"));

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        sfwPrice: isNaN(sfwPrice) ? null : sfwPrice,
        nsfwPrice: isNaN(nsfwPrice) ? null : nsfwPrice,
      },
    });

    redirect("/dashboard/settings");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Creator Settings</h1>

      <form action={updatePrices} className="space-y-6 bg-black/20 p-6 rounded-lg">
        <div>
          <label className="block font-semibold mb-2">SFW Monthly Price ($)</label>
          <input
            type="number"
            name="sfwPrice"
            defaultValue={user?.sfwPrice ?? ""}
            className="w-full p-2 rounded bg-black/40 border border-gray-600"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">NSFW Monthly Price ($)</label>
          <input
            type="number"
            name="nsfwPrice"
            defaultValue={user?.nsfwPrice ?? ""}
            className="w-full p-2 rounded bg-black/40 border border-gray-600"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white w-full"
        >
          Save Prices
        </button>
      </form>
    </div>
  );
}
