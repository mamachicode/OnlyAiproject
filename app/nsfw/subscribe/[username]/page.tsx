import prisma from "@/lib/prisma";

export default async function NsfwSubscribePage({ params }) {
  const { username } = params;

  const creator = await prisma.user.findUnique({
    where: { username },
    select: { username: true, nsfwPrice: true }
  });

  if (!creator) return <div className="p-10 text-red-600">Creator not found</div>;

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-4">Subscribe to {creator.username}</h1>

      <p className="text-lg mb-4">NSFW Subscription: ${creator.nsfwPrice}</p>

      <a
        href={`/api/ccbill/create-link?creator=${creator.username}&section=NSFW`}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Continue to Billing
      </a>
    </div>
  );
}
