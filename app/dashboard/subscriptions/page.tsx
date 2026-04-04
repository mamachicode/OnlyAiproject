// @ts-nocheck
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SubscriptionsPage() {
  const { data, error, isLoading } = useSWR("/api/subscription/check", fetcher);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading subscriptions.</p>;

  const subscriptions = data?.subscriptions ?? [];

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Your Active Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <p>You are not subscribed to anyone yet.</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub: any) => (
            <div
              key={sub.id}
              className="border p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">
                  {sub.creator?.username}
                </h2>
                <p className="text-gray-600 text-sm">
                  Active: {sub.active ? "Yes" : "No"}
                </p>
              </div>
              <button className="bg-red-600 px-4 py-2 text-white rounded">
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
