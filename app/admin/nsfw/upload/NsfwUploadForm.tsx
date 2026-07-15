"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Props = {
  publicHandle: string;
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

export default function NsfwUploadForm({
  publicHandle,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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

      for (const file of files) {
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
        <label
          htmlFor="media"
          className="text-sm font-black text-white"
        >
          Images
        </label>

        <input
          id="media"
          name="media"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          required
          disabled={uploading}
          onChange={(event) =>
            setFiles(Array.from(event.target.files || []))
          }
          className="mt-2 block w-full rounded-2xl border border-dashed border-white/20 bg-black/30 p-5 text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-red-500/15 file:px-4 file:py-2 file:font-black file:text-red-100 disabled:opacity-60"
        />

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Add 1–5 images. Each image must be 20 MB or smaller.
        </p>
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

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-full bg-red-500 px-6 py-4 text-sm font-black text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading
          ? "Uploading private content..."
          : "Publish to private review profile"}
      </button>
    </form>
  );
}
