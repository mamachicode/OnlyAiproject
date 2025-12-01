'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/check-subscription', { credentials: 'include' });
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        if (data?.active) {
          setOk(true);
        } else {
          router.replace('/subscribe');
        }
      } catch {
        router.replace('/login');
      }
    };
    run();
  }, [router]);

  if (ok === null) {
    return (
      <div className="p-10">
        <p className="text-gray-600">Checking your subscription…</p>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">🎉 Creator Dashboard</h1>
      <p className="mt-4 text-gray-600">Only active subscribers can access this page.</p>
      {/* TODO: add creator tools here */}
    </div>
  );
}
