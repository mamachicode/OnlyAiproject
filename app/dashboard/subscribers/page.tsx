// @ts-nocheck
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SubscribersPage() {
  const { data, error, isLoading } = useSWR("/api/user/subscription", fetcher);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading subscribers.</p>;

  const subscribers = data?.subscribers ?? [];

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Your Subscribers</h1>

      {subscribers.length === 0 ? (
        <p>No subscribers yet.</p>
      ) : (
        <div className="space-y-4">
          {subscribers.map((sub: any) => (
            <div key={sub.id} className="border p-4 rounded">
              <p className="font-semibold">{sub.subscriber.email}</p>
              <p className="text-gray-600 text-sm">
                Active: {sub.active ? "Yes" : "No"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
