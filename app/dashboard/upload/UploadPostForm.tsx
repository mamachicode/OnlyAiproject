// @ts-nocheck
"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

function makeFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function isAllowedMedia(file: File) {
  return file.type.startsWith("image/") || ALLOWED_VIDEO_MIMES.has(file.type);
}

function validateUploadMix(files: File[]) {
  const videoFiles = files.filter((file) => file.type.startsWith("video/"));

  if (videoFiles.length > 1) {
    return "For now, upload one short video at a time.";
  }

  if (videoFiles.length === 1 && files.length > 1) {
    return "For now, upload either multiple images or one short video.";
  }

  return "";
}

export default function UploadPostForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedRef = useRef<any[]>([]);

  const [selected, setSelected] = useState<any[]>([]);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    selectedRef.current = selected;

    if (!inputRef.current || typeof DataTransfer === "undefined") return;

    const transfer = new DataTransfer();

    for (const item of selected) {
      transfer.items.add(item.file);
    }

    inputRef.current.files = transfer.files;
  }, [selected]);

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
  }, []);

  function appendFiles(nextFiles: File[]) {
    const allowed = nextFiles.filter(isAllowedMedia);

    if (!allowed.length) {
      setLocalError("Use images, or one MP4/MOV/WebM video.");
      return;
    }

    const existingIds = new Set(selected.map((item) => item.id));
    const freshFiles = allowed.filter((file) => !existingIds.has(makeFileId(file)));
    const combinedFiles = [...selected.map((item) => item.file), ...freshFiles];

    const mixError = validateUploadMix(combinedFiles);

    if (mixError) {
      setLocalError(mixError);
      return;
    }

    const nextItems = freshFiles.map((file) => ({
      id: makeFileId(file),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelected((current) => [...current, ...nextItems]);
    setLocalError("");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    appendFiles(Array.from(event.target.files || []));
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    appendFiles(Array.from(event.dataTransfer.files || []));
  }

  function handlePaste(event: React.ClipboardEvent<HTMLFormElement>) {
    const files = Array.from(event.clipboardData.files || []).filter(
      isAllowedMedia
    );

    if (!files.length) return;

    event.preventDefault();
    appendFiles(files);
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

    setSelected([]);
    setLocalError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selected.length) {
      event.preventDefault();
      setLocalError("Add at least one image or short video before uploading.");
      return;
    }

    setSubmitting(true);
  }

  return (
    <form
      action="/api/posts/upload"
      method="POST"
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      onPaste={handlePaste}
      className="mt-8 space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20"
    >
      <div>
        <label className="block text-sm font-bold text-zinc-300">Title</label>
        <input
          name="title"
          placeholder="New drop"
          maxLength={90}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-pink-400/40"
        />
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Keep titles simple during the SFW soft launch, like “New drop” or “Exclusive AI art”.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-zinc-300">
          Caption / story text
        </label>
        <textarea
          name="content"
          rows={5}
          maxLength={1500}
          placeholder="Write a clean SFW caption or leave this empty..."
          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-pink-400/40"
        />
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Optional. Avoid adult or explicit wording while OnlyAi is in the SFW Stripe launch.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-zinc-300">
          Images or video
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
            required={!selected.length}
            onChange={handleInputChange}
            className="sr-only"
          />

          <p className="text-base font-black text-white sm:hidden">
            Tap to choose from your photos
          </p>

          <p className="hidden text-base font-black text-white sm:block">
            Click to choose, drag images here, or paste from clipboard
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-500 sm:hidden">
            Images up to 20MB, or one short video up to 25MB.
          </p>

          <p className="mt-2 hidden text-xs leading-5 text-zinc-500 sm:block">
            Images up to 20MB, or one MP4/MOV/WebM video up to 25MB. File names are checked by the SFW safety filter too.
          </p>
        </div>

        {localError ? (
          <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-100">
            {localError}
          </div>
        ) : null}

        {selected.length ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">
                Selected media ({selected.length})
              </p>

              <button
                type="button"
                onClick={clearFiles}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-300 hover:bg-white/10"
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
                  <div className="aspect-[4/3] bg-black">
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
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="space-y-3 p-3">
                    <p className="truncate text-xs font-bold text-zinc-300">
                      {item.file.name || "Pasted image"}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="w-full rounded-full border border-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/10"
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-pink-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-950/30 hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Uploading..." : "Upload post"}
        </button>

        <Link
          href="/dashboard/posts"
          className="rounded-full border border-white/10 px-6 py-3 text-center text-sm font-black text-white hover:bg-white/10"
        >
          Back to posts
        </Link>
      </div>
    </form>
  );
}
