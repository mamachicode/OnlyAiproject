type ManualReviewAlert = {
  source: "post_upload" | "post_update";
  postId: string;
  userId: string;
  mediaCount: number;
  publicIds?: string[];
};

function getBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://weareonlyai.com"
  ).replace(/\/$/, "");
}

export async function sendManualReviewAlert({
  source,
  postId,
  userId,
  mediaCount,
  publicIds = [],
}: ManualReviewAlert) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "").trim();

  const reviewUrl = `${getBaseUrl()}/admin/manual-review/${postId}`;

  if (!token || !chatId) {
    console.warn("TELEGRAM_MANUAL_REVIEW_NOT_CONFIGURED", {
      source,
      postId,
      userId,
      mediaCount,
      reviewUrl,
    });
    return;
  }

  const lines = [
    "⚠️ OnlyAi manual review required",
    "",
    `Source: ${source === "post_upload" ? "New post" : "Post update"}`,
    `Post ID: ${postId}`,
    `Creator user ID: ${userId}`,
    `New media requiring review: ${mediaCount}`,
    "Reason: Sightengine quota reached",
    `Review: ${reviewUrl}`,
  ];

  if (publicIds.length) {
    lines.push("", "Cloudinary IDs:");
    lines.push(...publicIds.slice(0, 10).map((id) => `• ${id}`));
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          disable_web_page_preview: true,
        }),
      }
    );

    if (!response.ok) {
      console.error("TELEGRAM_MANUAL_REVIEW_ALERT_FAILED", {
        status: response.status,
        body: await response.text().catch(() => ""),
        postId,
      });
    }
  } catch (error) {
    console.error("TELEGRAM_MANUAL_REVIEW_ALERT_FAILED", {
      postId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
