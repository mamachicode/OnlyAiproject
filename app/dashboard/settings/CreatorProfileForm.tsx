"use client";

import { useState, type FormEvent } from "react";

type CreatorProfileFormProps = {
  currentDisplayName: string;
  currentHandle: string;
  currentBio: string;
  currentMonthlyPrice: number;
};

type ImageFocus = "top" | "center" | "bottom";

type CropOptions = {
  outputWidth: number;
  outputHeight: number;
  maxBytes: number;
  label: string;
  focus: ImageFocus;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };

    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress image."));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

function focusOffset(extraSpace: number, focus: ImageFocus) {
  if (focus === "top") return 0;
  if (focus === "bottom") return extraSpace;
  return extraSpace / 2;
}

async function cropAndCompressImage(
  file: File,
  options: CropOptions
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${options.label} must be an image file.`);
  }

  const img = await loadImage(file);

  const imageWidth = img.naturalWidth || img.width;
  const imageHeight = img.naturalHeight || img.height;

  if (!imageWidth || !imageHeight) {
    throw new Error(`${options.label} could not be read.`);
  }

  const targetRatio = options.outputWidth / options.outputHeight;
  const imageRatio = imageWidth / imageHeight;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (imageRatio > targetRatio) {
    sourceHeight = imageHeight;
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
    sourceY = 0;
  } else {
    sourceWidth = imageWidth;
    sourceHeight = imageWidth / targetRatio;
    sourceX = 0;
    sourceY = focusOffset(imageHeight - sourceHeight, options.focus);
  }

  let quality = 0.88;
  let outputWidth = options.outputWidth;
  let outputHeight = options.outputHeight;
  let lastBlob: Blob | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Image cropping is not supported on this device.");
    }

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    lastBlob = blob;

    if (blob.size <= options.maxBytes) {
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
        type: "image/jpeg",
      });
    }

    quality -= 0.1;

    if (quality < 0.52) {
      outputWidth = Math.max(1, Math.round(outputWidth * 0.84));
      outputHeight = Math.max(1, Math.round(outputHeight * 0.84));
      quality = 0.8;
    }
  }

  if (lastBlob) {
    return new File([lastBlob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
    });
  }

  throw new Error(`${options.label} could not be compressed.`);
}

export default function CreatorProfileForm({
  currentDisplayName,
  currentHandle,
  currentBio,
  currentMonthlyPrice,
}: CreatorProfileFormProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [avatarFocus, setAvatarFocus] = useState<ImageFocus>("center");
  const [bannerFocus, setBannerFocus] = useState<ImageFocus>("top");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setStatus("Preparing images...");

    try {
      const form = event.currentTarget;
      const source = new FormData(form);
      const next = new FormData();

      next.set("displayName", String(source.get("displayName") || ""));
      next.set("handle", String(source.get("handle") || ""));
      next.set("bio", String(source.get("bio") || ""));
      next.set("sfwPrice", String(source.get("sfwPrice") || ""));

      const avatar = source.get("avatar");
      const banner = source.get("banner");

      if (avatar instanceof File && avatar.size > 0) {
        const croppedAvatar = await cropAndCompressImage(avatar, {
          outputWidth: 1200,
          outputHeight: 1200,
          maxBytes: 1_500_000,
          label: "Avatar",
          focus: avatarFocus,
        });

        next.set("avatar", croppedAvatar);
      }

      if (banner instanceof File && banner.size > 0) {
        const croppedBanner = await cropAndCompressImage(banner, {
          outputWidth: 2400,
          outputHeight: 800,
          maxBytes: 2_500_000,
          label: "Banner",
          focus: bannerFocus,
        });

        next.set("banner", croppedBanner);
      }

      setStatus("Saving profile...");

      const response = await fetch("/api/creator/profile", {
        method: "POST",
        body: next,
      });

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      if (!response.ok) {
        throw new Error("Could not save creator profile.");
      }

      window.location.href = "/dashboard/settings?saved=1";
    } catch (err: any) {
      setStatus("");
      setError(err?.message || "Could not save creator profile.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      action="/api/creator/profile"
      method="POST"
      encType="multipart/form-data"
      className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-zinc-100">
            Display name
          </span>

          <input
            name="displayName"
            maxLength={50}
            defaultValue={currentDisplayName}
            placeholder="Your creator name"
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-5 font-semibold text-white outline-none placeholder:text-zinc-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-zinc-100">
            Creator handle
          </span>

          <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/30 px-5">
            <span className="text-zinc-500">@</span>
            <input
              name="handle"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              defaultValue={currentHandle}
              className="w-full bg-transparent px-4 py-5 font-semibold text-white outline-none"
            />
          </div>
        </label>
      </div>

      <label className="mt-8 block">
        <span className="text-sm font-bold text-zinc-100">Bio</span>

        <textarea
          name="bio"
          rows={4}
          maxLength={280}
          defaultValue={currentBio}
          placeholder="Tell fans what you post and why they should subscribe..."
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-5 font-semibold text-white outline-none placeholder:text-zinc-600"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Keep it payment-safe. Max 280 characters.
        </p>
      </label>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <label className="block">
            <span className="text-sm font-bold text-zinc-100">
              Avatar image
            </span>

            <input
              name="avatar"
              type="file"
              accept="image/*"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Avatar crop
            </span>

            <select
              value={avatarFocus}
              onChange={(event) =>
                setAvatarFocus(event.target.value as ImageFocus)
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-bold text-white outline-none"
            >
              <option value="center">Center</option>
              <option value="top">Top / face</option>
            </select>
          </label>

          <p className="mt-2 text-xs text-zinc-500">
            Pick Top if the face is too low. Pick Center for normal portraits.
          </p>
        </div>

        <div>
          <label className="block">
            <span className="text-sm font-bold text-zinc-100">
              Banner image
            </span>

            <input
              name="banner"
              type="file"
              accept="image/*"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-bold file:text-white"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Banner crop
            </span>

            <select
              value={bannerFocus}
              onChange={(event) =>
                setBannerFocus(event.target.value as ImageFocus)
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 font-bold text-white outline-none"
            >
              <option value="top">Top / face</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>

          <p className="mt-2 text-xs text-zinc-500">
            Pick Top for portrait images. Wide images work best for banners.
          </p>
        </div>
      </div>

      <label className="mt-8 block">
        <span className="text-sm font-bold text-zinc-100">
          Monthly price
        </span>

        <div className="mt-3 flex items-center rounded-2xl border border-white/10 bg-black/30 px-5">
          <span className="text-zinc-500">$</span>
          <input
            name="sfwPrice"
            required
            min={1}
            max={500}
            type="number"
            defaultValue={currentMonthlyPrice}
            className="w-full bg-transparent px-4 py-5 font-semibold text-white outline-none"
          />
          <span className="text-zinc-500">/month</span>
        </div>
      </label>

      {status ? (
        <p className="mt-5 rounded-2xl border border-pink-400/20 bg-pink-500/10 p-4 text-sm font-bold text-pink-100">
          {status}
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-5 text-lg font-black text-white shadow-2xl shadow-pink-500/20 transition hover:scale-[1.01]"
      >
        Save creator profile
      </button>
    </form>
  );
}
