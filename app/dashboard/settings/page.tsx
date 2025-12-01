import { auth } from "@/src/auth";
import prisma from "@/src/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="p-10 text-red-600">Not logged in</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionPrice: true },
  });

  async function updatePrice(formData: FormData) {
    "use server";

    const price = Number(formData.get("price"));
    if (!price || price < 1) return;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionPrice: price },
    });
  }

  return (
    <div className="p-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-4">Subscription Price</h1>

      <p className="mb-4 text-gray-700">
        Current price: <strong>${user?.subscriptionPrice}</strong> / month
      </p>

      <form action={updatePrice} className="space-y-4">
        <input
          type="number"
          name="price"
          placeholder="Enter new price"
          className="border p-2 w-full"
          min="1"
          required
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          Save Price
        </button>
      </form>
    </div>
  );
}
