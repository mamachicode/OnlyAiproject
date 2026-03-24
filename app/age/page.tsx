import { Suspense } from "react";
import AgeClient from "./AgeClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <AgeClient />
    </Suspense>
  );
}
