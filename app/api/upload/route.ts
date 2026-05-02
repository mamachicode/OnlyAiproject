import { POST as uploadPost } from "@/app/api/posts/upload/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return uploadPost(req);
}
