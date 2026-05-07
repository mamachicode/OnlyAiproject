// @ts-nocheck
export const dynamic = "force-dynamic";

import { requireCreatorPage } from "@/src/lib/creatorGuard";
import PostsClient from "./PostsClient";

export default async function DashboardPostsPage() {
  await requireCreatorPage("/dashboard/posts");

  return <PostsClient />;
}
