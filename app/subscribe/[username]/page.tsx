// @ts-nocheck
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/auth";

export default async function SubscribePage({ params }) {
  const { username } = params;

  const creator = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      sfwPrice: true,
      nsfwPrice: true,
    },
  });

  if (!creator) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Creator not found</h1>
      </div>
    );
  }

  const session = await getServerAuthSession();
  const isLoggedIn = !!session;

  return (
    <div className="max-w-xl mx-auto p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Subscribe to {creator.username}
      </h1>

      {!isLoggedIn ? (
        <p className="text-center text-gray-500">
          Please log in to subscribe.
        </p>
      ) : (
        <>
          <div className="space-y-6">

            {/* SFW */}
            <div className="border p-4 rounded">
              <p className="font-semibold">
                SFW Subscription — ${creator.sfwPrice} USD every 30 days
              </p>

              <p className="text-sm text-gray-600 mt-2">
                This is a recurring subscription. Your payment method will be
                charged automatically every 30 days until you cancel.
              </p>

              <p className="text-sm text-gray-600 mt-2">
                You may cancel anytime from your account settings or through
                the billing provider.
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Billing descriptor will appear on your statement according to
                CCBill processing terms.
              </p>

              <a
                href={`/api/ccbill/create-link?creator=${creator.username}&section=SFW`}
                className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
              >
                Continue to Secure Billing
              </a>
            </div>

            {/* NSFW */}
            <div className="border p-4 rounded">
              <p className="font-semibold">
                NSFW Subscription — ${creator.nsfwPrice} USD every 30 days
              </p>

              <p className="text-sm text-gray-600 mt-2">
                This is a recurring subscription. Your payment method will be
                charged automatically every 30 days until you cancel.
              </p>

              <p className="text-sm text-gray-600 mt-2">
                You may cancel anytime from your account settings or through
                the billing provider.
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Billing descriptor will appear on your statement according to
                CCBill processing terms.
              </p>

              <a
                href={`/api/ccbill/create-link?creator=${creator.username}&section=NSFW`}
                className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
              >
                Continue to Secure Billing
              </a>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1 mt-6">
            <p>
              By subscribing, you agree to our{" "}
              <a href="/legal/terms" className="underline">Terms</a>,{" "}
              <a href="/legal/privacy" className="underline">Privacy Policy</a>, and{" "}
              <a href="/legal/refund" className="underline">Refund Policy</a>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
