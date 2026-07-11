"use client";
// @ts-nocheck

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type ExistingMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  order: number;
  publicId?: string;
};

type EditPost = {
  id: string;
  title: string;
  content: string;
  isLocked: boolean;
  media: ExistingMedia[];
};

type SelectedMedia = {
  id: string;
  file: File;
  previewUrl: string;
};

type UploadSignature = {
  apiKey: string;
  cloudName: string;
  context: string;
  folder: string;
  signature: string;
  timestamp: number;
  uploadUrl: string;
};

type UploadedCloudinaryMedia = {
  url: string;
  publicId: string;
  type: "IMAGE" | "VIDEO";
  resourceType: "image" | "video";
  bytes: number;
  format?: string;
};

const MAX_IMAGES_PER_POST = 10;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

function isAllowedMedia(file: File) {
  return ALLOWED_IMAGE_MIMES.has(file.type) || ALLOWED_VIDEO_MIMES.has(file.type);
}

function isImage(file: File) {
  return ALLOWED_IMAGE_MIMES.has(file.type);
}

function isVideo(file: File) {
  return ALLOWED_VIDEO_MIMES.has(file.type);
}

function makeFileId(file: File) {
  return `${file.name || "pasted-image"}|${file.type}|${file.size}`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";

  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
}

function uploadErrorMessage(code: string) {
  const messages: Record<string, string> = {
    auth: "Please log in as a creator before editing posts.",
    count: "Add up to 10 images per post.",
    failed: "Save failed. Try again with a different image or a smaller batch.",
    moderation:
      "That image could not be added. Keep it SFW and try a different image or simpler crop.",
    size: "One file is too large. Images can be up to 20MB each, and videos up to 25MB.",
    storage: "Media storage had a problem. Try again in a moment.",
    text: "Some wording could not be saved. Edit the title or description and try again.",
    video: "Use either up to 10 images, or one MP4/MOV/WebM video.",
  };

  return messages[code] || messages.failed;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return uploadErrorMessage("failed");
}

function validateEditMedia(
  files: File[],
  existingMedia: ExistingMedia[],
  removeMediaIds: Set<string>
) {
  const remainingMedia = existingMedia.filter((item) => !removeMediaIds.has(item.id));
  const imageCount =
    remainingMedia.filter((item) => item.type === "IMAGE").length +
    files.filter(isImage).length;

  const videoCount =
    remainingMedia.filter((item) => item.type === "VIDEO").length +
    files.filter(isVideo).length;

  if (videoCount > 1) {
    return "Only one video can be added per post right now.";
  }

  if (videoCount === 1 && imageCount > 0) {
    return "Use either multiple images or one short video for now.";
  }

  if (imageCount > MAX_IMAGES_PER_POST) {
    return "Add up to 10 images per post.";
  }

  const oversizedImage = files.find(
    (file) => isImage(file) && file.size > MAX_IMAGE_BYTES
  );

  if (oversizedImage) {
    return "One image is too large. Images can be up to 20MB each.";
  }

  const oversizedVideo = files.find(
    (file) => isVideo(file) && file.size > MAX_VIDEO_BYTES
  );

  if (oversizedVideo) {
    return "That video is too large. Max 25MB.";
  }

  return "";
}

async function getUploadSignature() {
  const res = await fetch("/api/cloudinary/sign-post-upload", {
    method: "POST",
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    if (payload?.redirectTo) {
      window.location.href = payload.redirectTo;
      throw new Error("Redirecting...");
    }

    throw new Error(uploadErrorMessage(payload?.error || "storage"));
  }

  return payload as UploadSignature;
}

async function uploadFileToCloudinary(
  file: File,
  signature: UploadSignature
): Promise<UploadedCloudinaryMedia> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("context", signature.context);
  formData.append("folder", signature.folder);
  formData.append("signature", signature.signature);
  formData.append("timestamp", String(signature.timestamp));

  const res = await fetch(signature.uploadUrl, {
    method: "POST",
    body: formData,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.secure_url || !payload?.public_id) {
    throw new Error(
      payload?.error?.message ||
        "This media could not be uploaded. Try again with a different file."
    );
  }

  const resourceType = payload.resource_type === "video" ? "video" : "image";

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    type: resourceType === "video" ? "VIDEO" : "IMAGE",
    resourceType,
    bytes: Number(payload.bytes || file.size || 0),
    format: payload.format,
  };
}

export default function EditPostForm({ post }: { post: EditPost }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedRef = useRef<SelectedMedia[]>([]);
  const [selected, setSelected] = useState<SelectedMedia[]>([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<Set<string>>(new Set());
  const [localError, setLocalError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("moderation") === "manual_review") {
      setStatusMessage(
        "Your post was saved and is pending a routine manual safety review."
      );
    } else if (params.get("moderation") === "suggestive") {
      setStatusMessage(
        "Some viewers may consider this content suggestive, but it complies with the current SFW guidelines."
      );
    } else if (params.get("saved") === "1") {
      setStatusMessage("Post saved successfully.");
    }
  }, []);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    type: "IMAGE" | "VIDEO";
    label: string;
  } | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (!previewMedia) return;

    function handlePreviewKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewMedia(null);
      }
    }

    window.addEventListener("keydown", handlePreviewKeyDown);

    return () => {
      window.removeEventListener("keydown", handlePreviewKeyDown);
    };
  }, [previewMedia]);

  const appendFiles = useCallback(
    (nextFiles: File[]) => {
      const allowed = nextFiles.filter(isAllowedMedia);

      if (!allowed.length) {
        setLocalError("Use images, or one MP4/MOV/WebM video.");
        return;
      }

      setSelected((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const freshFiles = allowed.filter(
          (file) => !existingIds.has(makeFileId(file))
        );
        const combinedFiles = [...current.map((item) => item.file), ...freshFiles];

        const mixError = validateEditMedia(combinedFiles, post.media, removeMediaIds);

        if (mixError) {
          setLocalError(mixError);
          return current;
        }

        if (!freshFiles.length) {
          setLocalError("");
          return current;
        }

        const nextItems = freshFiles.map((file) => ({
          id: makeFileId(file),
          file,
          previewUrl: URL.createObjectURL(file),
        }));

        setLocalError("");
        return [...current, ...nextItems];
      });
    },
    [post.media, removeMediaIds]
  );

  useEffect(() => {
    function handleWindowPaste(event: ClipboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      const files = Array.from(event.clipboardData?.files || []).filter(
        isAllowedMedia
      );

      if (!files.length) return;

      event.preventDefault();
      appendFiles(files);
    }

    window.addEventListener("paste", handleWindowPaste);

    return () => {
      window.removeEventListener("paste", handleWindowPaste);

      for (const item of selectedRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, [appendFiles]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(Array.from(event.target.files || []));
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    appendFiles(Array.from(event.dataTransfer.files || []));
  }

  function removeFile(id: string) {
    setSelected((current) => {
      const removed = current.find((item) => item.id === id);

      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function clearFiles() {
    for (const item of selected) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }

    setPreviewMedia(null);
    setSelected([]);
    setLocalError("");
    setStatusMessage("");
  }

  function toggleRemoveMedia(id: string) {
    setRemoveMediaIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      const mixError = validateEditMedia(
        selected.map((item) => item.file),
        post.media,
        next
      );

      setLocalError(mixError);

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const selectedFiles = selected.map((item) => item.file);
    const mixError = validateEditMedia(selectedFiles, post.media, removeMediaIds);

    if (mixError) {
      setLocalError(mixError);
      return;
    }

    setSubmitting(true);
    setLocalError("");
    setStatusMessage(
      selectedFiles.length
        ? `Preparing ${selectedFiles.length} media upload${selectedFiles.length === 1 ? "" : "s"}...`
        : "Saving post..."
    );

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const title = String(formData.get("title") || "");
      const content = String(formData.get("content") || "");
      const isLocked = formData.get("isLocked") === "on";

      let uploadedMedia: UploadedCloudinaryMedia[] = [];

      if (selectedFiles.length) {
        const signature = await getUploadSignature();

        for (let i = 0; i < selectedFiles.length; i++) {
          setStatusMessage(`Uploading media ${i + 1} of ${selectedFiles.length}...`);
          uploadedMedia.push(await uploadFileToCloudinary(selectedFiles[i], signature));
        }
      }

      setStatusMessage("Checking media safety and saving post...");

      const res = await fetch("/api/posts/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          title,
          content,
          isLocked,
          removeMediaIds: Array.from(removeMediaIds),
          media: uploadedMedia,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.ok) {
        if (payload?.redirectTo) {
          window.location.href = payload.redirectTo;
          return;
        }

        throw new Error(
          payload?.message || uploadErrorMessage(payload?.error || "failed")
        );
      }

      window.location.href =
        payload.redirectTo || `/dashboard/posts/${post.id}/edit?saved=1`;
    } catch (error) {
      setSubmitting(false);
      setStatusMessage("");
      setLocalError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
        <div>
          <label className="block text-sm font-bold text-zinc-300">
            Title
          </label>
          <input
            name="title"
            defaultValue={post.title || ""}
            maxLength={90}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-300">
            Description
          </label>
          <textarea
            name="content"
            rows={6}
            maxLength={1500}
            defaultValue={post.content || ""}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm font-bold text-zinc-200">
          <input
            type="checkbox"
            name="isLocked"
            defaultChecked={post.isLocked}
            className="h-5 w-5"
          />
          Members-only locked post
        </label>

        <div>
          <label className="block text-sm font-bold text-zinc-300">
            Add media
          </label>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={
              dragging
                ? "mt-2 cursor-pointer rounded-3xl border border-pink-300/60 bg-pink-500/10 p-6 text-center outline-none transition"
                : "mt-2 cursor-pointer rounded-3xl border border-dashed border-white/15 bg-black/30 p-6 text-center outline-none transition hover:border-pink-400/40 hover:bg-white/[0.04]"
            }
          >
            <input
              ref={inputRef}
              name="files"
              type="file"
              accept="image/*,video/mp4,video/quicktime,video/webm"
              multiple
              onChange={handleInputChange}
              className="sr-only"
            />

            <p className="text-base font-black text-white sm:hidden">
              Tap to add more media
            </p>

            <p className="hidden text-base font-black text-white sm:block">
              Choose files, drag, or paste
            </p>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Up to 10 images or 1 video.
            </p>
          </div>

          {localError ? (
            <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-100">
              {localError}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="mt-3 rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4 text-sm font-bold text-pink-100">
              {statusMessage}
            </div>
          ) : null}

          {selected.length ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-white">
                  New selected media ({selected.length})
                </p>

                <button
                  type="button"
                  onClick={clearFiles}
                  disabled={submitting}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selected.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewMedia({
                        url: item.previewUrl,
                        type: item.file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
                        label: item.file.name || "Selected media",
                      })}
                      disabled={submitting}
                      className="aspect-[4/3] w-full cursor-zoom-in bg-black disabled:cursor-not-allowed disabled:opacity-70"
                      aria-label="Preview selected media"
                    >
                      {item.file.type.startsWith("video/") ? (
                        <video
                          src={item.previewUrl}
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name || "Selected image"}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                    <div className="space-y-3 p-3">
                      <p className="truncate text-xs font-bold text-zinc-300">
                        {item.file.name || "Pasted image"}
                      </p>

                      <p className="text-xs font-bold text-zinc-500">
                        {formatBytes(item.file.size)}
                      </p>

                      <button
                        type="button"
                        onClick={() => setPreviewMedia({
                          url: item.previewUrl,
                          type: item.file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
                          label: item.file.name || "Selected media",
                        })}
                        disabled={submitting}
                        className="w-full rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-xs font-black text-pink-100 hover:bg-pink-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Preview selected upload"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        disabled={submitting}
                        className="w-full rounded-full border border-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

          {previewMedia ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Selected media preview"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setPreviewMedia(null)}
            >
              <div
                className="relative w-full max-w-5xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="absolute right-0 top-0 z-10 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
                >
                  Close
                </button>

                <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-black">
                  {previewMedia.type === "VIDEO" ? (
                    <video
                      src={previewMedia.url}
                      controls
                      playsInline
                      className="max-h-[82vh] w-full object-contain"
                    />
                  ) : (
                    <img
                      src={previewMedia.url}
                      alt={previewMedia.label}
                      className="max-h-[82vh] w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-pink-500 px-6 py-3 text-sm font-black text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save post"}
        </button>
      </div>

      <aside className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5">
        <h2 className="text-xl font-black">Current media</h2>
        <p className="mt-2 text-sm text-zinc-500">
          {post.media.length} item{post.media.length === 1 ? "" : "s"} in this post.
        </p>

        <div className="mt-5 grid gap-4">
          {post.media.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-500">
              No media attached.
            </div>
          ) : (
            post.media.map((item, index) => {
              const markedForRemoval = removeMediaIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={
                    markedForRemoval
                      ? "overflow-hidden rounded-2xl border border-red-400/30 bg-black opacity-60"
                      : "overflow-hidden rounded-2xl border border-white/10 bg-black"
                  }
                >
                  <div className="aspect-[4/5] bg-zinc-900">
                    {item.type === "VIDEO" ? (
                      <video src={item.url} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={item.url} alt={post.title || "Post media"} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-3 p-3 text-xs text-zinc-400">
                    <div>Item {index + 1} · {item.type}</div>

                    <label className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 font-bold text-red-100">
                      <input
                        type="checkbox"
                        checked={markedForRemoval}
                        onChange={() => toggleRemoveMedia(item.id)}
                        className="h-4 w-4"
                      />
                      Remove this media when saving
                    </label>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </form>
  );
}
