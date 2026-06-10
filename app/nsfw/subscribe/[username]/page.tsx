import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function HiddenSubscribePageRedirect({ params }: PageProps) {
  const { username } = await params;
  redirect(`/public/creator/${encodeURIComponent(decodeURIComponent(username))}`);
}
