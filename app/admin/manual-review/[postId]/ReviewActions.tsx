"use client";

type ReviewActionsProps = {
  postId: string;
};

export default function ReviewActions({
  postId,
}: ReviewActionsProps) {
  function confirmRemoval(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    const confirmed = window.confirm(
      "Remove this post from OnlyAi and delete all of its media?"
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <>
      <form action="/api/admin/manual-review/action" method="post">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="action" value="approve" />

        <button
          type="submit"
          className="rounded-full bg-green-400 px-5 py-3 text-sm font-black text-black hover:bg-green-300"
        >
          Approve post
        </button>
      </form>

      <form action="/api/admin/manual-review/action" method="post">
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="action" value="remove" />

        <button
          type="submit"
          onClick={confirmRemoval}
          className="rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-400"
        >
          Remove post
        </button>
      </form>
    </>
  );
}
