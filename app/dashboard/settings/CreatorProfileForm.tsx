"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type FormEvent,
  type PointerEvent,
} from "react";

type CreatorProfileFormProps = {
  currentDisplayName: string;
  currentHandle: string;
  currentBio: string;
  currentMonthlyPrice: number;
};

type CropOptions = {
  outputWidth: number;
  outputHeight: number;
  maxBytes: number;
  label: string;
  focusX: number;
  focusY: number;
};

type CropFrameProps = {
  title: string;
  previewUrl: string;
  shape: "avatar" | "banner";
  focusX: number;
  focusY: number;
  setFocusX: (value: number) => void;
  setFocusY: (value: number) => void;
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

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 50;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function isImageFile(file: File | null | undefined) {
  return Boolean(file && file.type.startsWith("image/"));
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
  const focusX = clampPercent(options.focusX) / 100;
  const focusY = clampPercent(options.focusY) / 100;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (imageRatio > targetRatio) {
    sourceHeight = imageHeight;
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) * focusX;
    sourceY = 0;
  } else {
    sourceWidth = imageWidth;
    sourceHeight = imageWidth / targetRatio;
    sourceX = 0;
    sourceY = (imageHeight - sourceHeight) * focusY;
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

function CropFrame({
  title,
  previewUrl,
  shape,
  focusX,
  focusY,
  setFocusX,
  setFocusY,
}: CropFrameProps) {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startFocusX: number;
    startFocusY: number;
  } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!previewUrl) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startFocusX: focusX,
      startFocusY: focusY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const sensitivity = shape === "banner" ? 85 : 100;

    const deltaX = ((event.clientX - drag.startX) / Math.max(1, rect.width)) * sensitivity;
    const deltaY = ((event.clientY - drag.startY) / Math.max(1, rect.height)) * sensitivity;

    setFocusX(clampPercent(drag.startFocusX - deltaX));
    setFocusY(clampPercent(drag.startFocusY - deltaY));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  const isAvatar = shape === "avatar";

  return (
    <div className="mt-5 rounded-3xl border border-pink-400/20 bg-black/30 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-pink-300">
          {title}
        </p>
        <p className="text-xs font-semibold text-zinc-500">
          Drag image to frame it
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={
          isAvatar
            ? "relative mx-auto aspect-square w-full max-w-[320px] cursor-grab touch-none overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 active:cursor-grabbing"
            : "relative aspect-[3/1] w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 active:cursor-grabbing"
        }
      >
        <img
          src={previewUrl}
          alt={`${title} crop preview`}
          className="h-full w-full select-none object-cover"
          draggable={false}
          style={{ objectPosition: `${focusX}% ${focusY}%` }}
        />

        <div className="pointer-events-none absolute inset-0 bg-black/5" />

        {isAvatar ? (
          <>
            <div className="pointer-events-none absolute inset-6 rounded-full border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-black text-white opacity-80">
                Avatar crop
              </span>
            </div>
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-black text-white opacity-80">
              Banner crop
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Drag the image inside the frame. The saved image will match this crop.
      </p>
    </div>
  );
}

export default function CreatorProfileForm({
  currentDisplayName,
  currentHandle,
  currentBio,
  currentMonthlyPrice,
}: CreatorProfileFormProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFocusX, setAvatarFocusX] = useState(50);
  const [avatarFocusY, setAvatarFocusY] = useState(50);
  const [bannerFocusX, setBannerFocusX] = useState(50);
  const [bannerFocusY, setBannerFocusY] = useState(22);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("");
  const [avatarDragging, setAvatarDragging] = useState(false);
  const [bannerDragging, setBannerDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [bannerPreviewUrl]);

  function setInputFile(kind: "avatar" | "banner", file: File) {
    const input = kind === "avatar" ? avatarInputRef.current : bannerInputRef.current;

    if (!input) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
  }

  function selectProfileImage(kind: "avatar" | "banner", file: File | null | undefined) {
    if (!isImageFile(file)) {
      setError("Use an image file for your avatar or banner.");
      return;
    }

    setInputFile(kind, file);
    setError("");

    if (kind === "avatar") {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarFocusX(50);
      setAvatarFocusY(50);
      setAvatarPreviewUrl(URL.createObjectURL(file));
      return;
    }

    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerFocusX(50);
    setBannerFocusY(22);
    setBannerPreviewUrl(URL.createObjectURL(file));
  }

  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectProfileImage("avatar", event.target.files?.[0]);
  }

  function handleBannerFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectProfileImage("banner", event.target.files?.[0]);
  }

  function handleProfileDrop(
    kind: "avatar" | "banner",
    event: DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();

    if (kind === "avatar") {
      setAvatarDragging(false);
    } else {
      setBannerDragging(false);
    }

    const file = Array.from(event.dataTransfer.files || []).find((item) =>
      item.type.startsWith("image/")
    );

    selectProfileImage(kind, file);
  }

  function handleProfilePaste(
    kind: "avatar" | "banner",
    event: ClipboardEvent<HTMLLabelElement>
  ) {
    const file = Array.from(event.clipboardData.files || []).find((item) =>
      item.type.startsWith("image/")
    );

    if (!file) return;

    event.preventDefault();
    selectProfileImage(kind, file);
  }

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
          focusX: avatarFocusX,
          focusY: avatarFocusY,
        });

        next.set("avatar", croppedAvatar);
      }

      if (banner instanceof File && banner.size > 0) {
        const croppedBanner = await cropAndCompressImage(banner, {
          outputWidth: 2400,
          outputHeight: 800,
          maxBytes: 2_500_000,
          label: "Banner",
          focusX: bannerFocusX,
          focusY: bannerFocusY,
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

      window.location.href = "/dashboard?creatorSaved=1";
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
          Max 280 characters. Keep it clear for new members.
        </p>
      </label>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <span className="text-sm font-bold text-zinc-100">
            Avatar image
          </span>

          <label
            htmlFor="avatar-upload"
            tabIndex={0}
            onDragOver={(event) => {
              event.preventDefault();
              setAvatarDragging(true);
            }}
            onDragLeave={() => setAvatarDragging(false)}
            onDrop={(event) => handleProfileDrop("avatar", event)}
            onPaste={(event) => handleProfilePaste("avatar", event)}
            className={
              avatarDragging
                ? "mt-3 block cursor-pointer rounded-3xl border border-pink-300/60 bg-pink-500/10 p-5 text-center outline-none transition"
                : "mt-3 block cursor-pointer rounded-3xl border border-dashed border-white/15 bg-black/30 p-5 text-center outline-none transition hover:border-pink-400/40 hover:bg-white/[0.04]"
            }
          >
            <input
              ref={avatarInputRef}
              id="avatar-upload"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="sr-only"
            />

            <p className="text-sm font-black text-white">
              Click to choose, drag here, or paste an avatar image
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Square images work best. You can frame the crop before saving.
            </p>
          </label>

          {avatarPreviewUrl ? (
            <CropFrame
              title="Avatar preview"
              previewUrl={avatarPreviewUrl}
              shape="avatar"
              focusX={avatarFocusX}
              focusY={avatarFocusY}
              setFocusX={setAvatarFocusX}
              setFocusY={setAvatarFocusY}
            />
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Choose an avatar to preview the crop before saving.
            </p>
          )}
        </div>

        <div>
          <span className="text-sm font-bold text-zinc-100">
            Banner image
          </span>

          <label
            htmlFor="banner-upload"
            tabIndex={0}
            onDragOver={(event) => {
              event.preventDefault();
              setBannerDragging(true);
            }}
            onDragLeave={() => setBannerDragging(false)}
            onDrop={(event) => handleProfileDrop("banner", event)}
            onPaste={(event) => handleProfilePaste("banner", event)}
            className={
              bannerDragging
                ? "mt-3 block cursor-pointer rounded-3xl border border-pink-300/60 bg-pink-500/10 p-5 text-center outline-none transition"
                : "mt-3 block cursor-pointer rounded-3xl border border-dashed border-white/15 bg-black/30 p-5 text-center outline-none transition hover:border-pink-400/40 hover:bg-white/[0.04]"
            }
          >
            <input
              ref={bannerInputRef}
              id="banner-upload"
              name="banner"
              type="file"
              accept="image/*"
              onChange={handleBannerFileChange}
              className="sr-only"
            />

            <p className="text-sm font-black text-white">
              Click to choose, drag here, or paste a banner image
            </p>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Wide images work best. You can drag the crop before saving.
            </p>
          </label>

          {bannerPreviewUrl ? (
            <CropFrame
              title="Banner preview"
              previewUrl={bannerPreviewUrl}
              shape="banner"
              focusX={bannerFocusX}
              focusY={bannerFocusY}
              setFocusX={setBannerFocusX}
              setFocusY={setBannerFocusY}
            />
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Choose a banner to preview the crop before saving.
            </p>
          )}
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
            step={0.01}
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
