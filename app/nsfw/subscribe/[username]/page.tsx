import prisma from "@/lib/prisma";

export default async function NsfwSubscribePage({ params }) {
  const { username } = params;

  const creator = await prisma.user.findUnique({
    where: { username },
    select: { username: true, nsfwPrice: true }
  });

  if (!creator) {
    return <div className="p-10 text-red-600">Creator not found</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Subscribe to {creator.username}
      </h1>

      <div className="text-lg">
        <p>
          <strong>${creator.nsfwPrice} USD every 30 days</strong>
        </p>
        <p className="text-sm text-gray-600">
          This is a recurring subscription. Your payment method will be charged
          automatically every 30 days until you cancel.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          You may cancel anytime from your account settings or through the
          billing provider.
        </p>
      </div>

      <a
        href={`/api/ccbill/create-link?creator=${creator.username}&section=NSFW`}
        className="bg-red-600 text-white px-6 py-3 rounded block text-center"
      >
        Continue to Secure Billing
      </a>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          By subscribing, you agree to our{" "}
          <a href="/legal/terms" className="underline">Terms</a>,{" "}
          <a href="/legal/privacy" className="underline">Privacy Policy</a>, and{" "}
          <a href="/legal/refund" className="underline">Refund Policy</a>.
        </p>
      </div>
    </div>
  );
}
