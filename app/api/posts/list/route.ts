import { GET as getPosts } from "@/app/api/posts/route";

export const runtime = "nodejs";

export async function GET() {
  return getPosts();
}
