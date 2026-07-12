"use client";

type MediaReviewActionProps = {
  postId: string;
  mediaId: string;
  mediaType: "IMAGE" | "VIDEO";
  isLastMedia: boolean;
};

export default function MediaReviewAction({
  postId,
  mediaId,
  mediaType,
  isLastMedia,
}: MediaReviewActionProps) {
  function confirmRemoval(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    const label = mediaType === "VIDEO" ? "video" : "image";

    const message = isLastMedia
      ? `This is the last ${label} in the post. Removing it will also remove the entire post. Continue?`
      : `Remove only this ${label} from the post?`;

    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action="/api/admin/manual-review/action"
      method="post"
      className="mt-4"
    >
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="mediaId" value={mediaId} />
      <input type="hidden" name="action" value="remove_media" />

      <button
        type="submit"
        onClick={confirmRemoval}
        className="w-full rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-400/20"
      >
        {isLastMedia
          ? `Remove last ${mediaType === "VIDEO" ? "video" : "image"} and post`
          : `Remove this ${mediaType === "VIDEO" ? "video" : "image"}`}
      </button>
    </form>
  );
}
