"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  DragEvent,
  FormEvent,
} from "react";

type Props = {
  publicHandle: string;
};

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type UploadedMedia = {
  publicId: string;
  url: string;
  resourceType: "image";
  type: "IMAGE";
  bytes: number;
};

const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function isAllowedImage(file: File) {
  return ALLOWED_TYPES.has(file.type.toLowerCase());
}

function makeFileId(file: File) {
  return `${file.name || "pasted-image"}|${file.type}|${file.size}`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";

  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
}

export default function NsfwUploadForm({
  publicHandle,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedRef = useRef<SelectedImage[]>([]);

  const [selected, setSelected] = useState<SelectedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [previewItem, setPreviewItem] =
    useState<SelectedImage | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (!previewItem) return;

    function handlePreviewKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewItem(null);
      }
    }

    window.addEventListener("keydown", handlePreviewKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handlePreviewKeyDown
      );
    };
  }, [previewItem]);

  const appendFiles = useCallback((nextFiles: File[]) => {
    const allowed = nextFiles.filter(isAllowedImage);

    if (!allowed.length) {
      setError("Use JPEG, PNG, WebP, or GIF images.");
      return;
    }

    setSelected((current) => {
      const existingIds = new Set(
        current.map((item) => item.id)
      );

      const freshFiles = allowed.filter(
        (file) => !existingIds.has(makeFileId(file))
      );

      const combinedCount = current.length + freshFiles.length;

      if (combinedCount > MAX_IMAGES) {
        setError("Add up to 5 images per private post.");
        return current;
      }

      const oversized = freshFiles.find(
        (file) => file.size > MAX_IMAGE_BYTES
      );

      if (oversized) {
        setError("Each image must be 20 MB or smaller.");
        return current;
      }

      if (!freshFiles.length) {
        setError("");
        return current;
      }

      const nextItems = freshFiles.map((file) => ({
        id: makeFileId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setError("");
      return [...current, ...nextItems];
    });
  }, []);

  useEffect(() => {
    function handleWindowPaste(event: ClipboardEvent) {
      const pastedFiles = Array.from(
        event.clipboardData?.files || []
      ).filter(isAllowedImage);

      if (!pastedFiles.length) return;

      event.preventDefault();
      appendFiles(pastedFiles);
    }

    window.addEventListener("paste", handleWindowPaste);

    return () => {
      window.removeEventListener("paste", handleWindowPaste);

      for (const item of selectedRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, [appendFiles]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    appendFiles(Array.from(event.target.files || []));
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    appendFiles(Array.from(event.dataTransfer.files || []));
  }

  function removeFile(id: string) {
    if (previewItem?.id === id) {
      setPreviewItem(null);
    }

    setSelected((current) => {
      const removed = current.find((item) => item.id === id);

      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function clearFiles() {
    for (const item of selected) {
      URL.revokeObjectURL(item.previewUrl);
    }

    setPreviewItem(null);
    setSelected([]);
    setError("");
    setStatusMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const files = selected.map((item) => item.file);

    if (!files.length || files.length > MAX_IMAGES) {
      setError("Choose between 1 and 5 images.");
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
        setError("Only JPEG, PNG, WebP, and GIF images are accepted.");
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        setError("Each image must be 20 MB or smaller.");
        return;
      }
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const confirmations = [
      "adultConfirmation",
      "likenessConfirmation",
      "rightsConfirmation",
      "policyConfirmation",
    ];

    for (const name of confirmations) {
      if (formData.get(name) !== "on") {
        setError("All compliance confirmations are required.");
        return;
      }
    }

    setUploading(true);
    setStatusMessage(
      `Preparing ${files.length} image upload${
        files.length === 1 ? "" : "s"
      }...`
    );

    try {
      const signResponse = await fetch(
        "/api/admin/nsfw/sign-upload",
        {
          method: "POST",
        }
      );

      const signData = await signResponse.json();

      if (!signResponse.ok) {
        throw new Error(
          signData?.error || "Upload authorization failed."
        );
      }

      const uploadedMedia: UploadedMedia[] = [];

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        setStatusMessage(
          `Uploading image ${index + 1} of ${files.length}...`
        );

        const cloudinaryForm = new FormData();

        cloudinaryForm.append("file", file);
        cloudinaryForm.append("api_key", signData.apiKey);
        cloudinaryForm.append(
          "timestamp",
          String(signData.timestamp)
        );
        cloudinaryForm.append("signature", signData.signature);
        cloudinaryForm.append("folder", signData.folder);
        cloudinaryForm.append("context", signData.context);

        const uploadResponse = await fetch(
          signData.uploadUrl,
          {
            method: "POST",
            body: cloudinaryForm,
          }
        );

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData?.error?.message ||
              "An image could not be uploaded."
          );
        }

        uploadedMedia.push({
          publicId: uploadData.public_id,
          url: uploadData.secure_url,
          resourceType: "image",
          type: "IMAGE",
          bytes: Number(uploadData.bytes || file.size),
        });
      }

      setStatusMessage("Saving private post...");

      const saveResponse = await fetch(
        "/api/admin/nsfw/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: String(formData.get("title") || ""),
            content: String(formData.get("content") || ""),
            isLocked: formData.get("isLocked") === "on",
            confirmations: {
              adult:
                formData.get("adultConfirmation") === "on",
              likeness:
                formData.get("likenessConfirmation") === "on",
              rights:
                formData.get("rightsConfirmation") === "on",
              policy:
                formData.get("policyConfirmation") === "on",
            },
            media: uploadedMedia,
          }),
        }
      );

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(
          saveData?.error || "The post could not be created."
        );
      }

      window.location.href =
        saveData.redirectTo ||
        `/nsfw/creator/${encodeURIComponent(publicHandle)}`;
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The post could not be created."
      );
      setStatusMessage("");
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-7 rounded-3xl border border-white/10 bg-white/[0.04] p-6"
    >
      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm font-bold text-red-100">
          {error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="title"
          className="text-sm font-black text-white"
        >
          Post title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue="Private creator preview"
          disabled={uploading}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-400/50 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="text-sm font-black text-white"
        >
          Caption
        </label>

        <textarea
          id="content"
          name="content"
          rows={5}
          maxLength={2000}
          disabled={uploading}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-400/50 disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-black text-white">
          Add images
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
              ? "mt-2 cursor-pointer rounded-3xl border border-red-300/60 bg-red-500/10 p-7 text-center outline-none transition"
              : "mt-2 cursor-pointer rounded-3xl border border-dashed border-white/20 bg-black/30 p-7 text-center outline-none transition hover:border-red-400/40 hover:bg-white/[0.04]"
          }
        >
          <input
            ref={inputRef}
            id="media"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploading}
            onChange={handleInputChange}
            className="sr-only"
          />

          <p className="text-base font-black text-white sm:hidden">
            Tap to choose from your photos
          </p>

          <p className="hidden text-base font-black text-white sm:block">
            Choose images, drag, or paste
          </p>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Add up to 5 images. Each image can be up to 20 MB.
          </p>
        </div>

        {statusMessage ? (
          <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-100">
            {statusMessage}
          </div>
        ) : null}

        {selected.length ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">
                Selected images ({selected.length})
              </p>

              <button
                type="button"
                onClick={clearFiles}
                disabled={uploading}
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
                    onClick={() => setPreviewItem(item)}
                    disabled={uploading}
                    className="aspect-[4/3] w-full cursor-zoom-in bg-black disabled:cursor-not-allowed disabled:opacity-70"
                    aria-label="Preview selected image"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name || "Selected image"}
                      className="h-full w-full object-cover"
                    />
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
                      onClick={() => setPreviewItem(item)}
                      disabled={uploading}
                      className="w-full rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-black text-red-100 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      disabled={uploading}
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

      <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
        <input
          type="checkbox"
          name="isLocked"
          defaultChecked
          disabled={uploading}
          className="mt-1"
        />

        <span>
          <span className="block text-sm font-black">
            Subscriber-only content
          </span>

          <span className="mt-1 block text-xs leading-5 text-zinc-500">
            Billing remains disabled during processor review.
          </span>
        </span>
      </label>

      <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
        <p className="text-sm font-black text-amber-100">
          Required compliance confirmations
        </p>

        <label className="flex items-start gap-3 text-sm leading-6 text-amber-100/80">
          <input
            type="checkbox"
            name="adultConfirmation"
            required
            disabled={uploading}
            className="mt-1"
          />
          Every depicted subject is clearly an adult aged 18 or older.
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-amber-100/80">
          <input
            type="checkbox"
            name="likenessConfirmation"
            required
            disabled={uploading}
            className="mt-1"
          />
          No image depicts or intentionally resembles an identifiable real
          person without documented authorization.
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-amber-100/80">
          <input
            type="checkbox"
            name="rightsConfirmation"
            required
            disabled={uploading}
            className="mt-1"
          />
          OnlyAi owns or is authorized to use every uploaded image.
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-amber-100/80">
          <input
            type="checkbox"
            name="policyConfirmation"
            required
            disabled={uploading}
            className="mt-1"
          />
          The content complies with the Prohibited Content Policy.
        </label>
      </div>

      {previewItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Selected image preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute right-0 top-0 z-10 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
            >
              Close
            </button>

            <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-black">
              <img
                src={previewItem.previewUrl}
                alt={
                  previewItem.file.name ||
                  "Selected image preview"
                }
                className="max-h-[82vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={uploading || selected.length === 0}
        className="w-full rounded-full bg-red-500 px-6 py-4 text-sm font-black text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading
          ? "Uploading private content..."
          : "Publish to private review profile"}
      </button>
    </form>
  );
}
