"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
} from "react";

type ImageTarget = "avatar" | "banner";

type NsfwProfileFormProps = {
  displayName: string;
  bio: string;
  currentAvatarUrl: string;
  currentBannerUrl: string;
};

function isImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.type.startsWith("image/"));
}

export default function NsfwProfileForm({
  displayName,
  bio,
  currentAvatarUrl,
  currentBannerUrl,
}: NsfwProfileFormProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [activeTarget, setActiveTarget] =
    useState<ImageTarget>("avatar");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }

    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview("");
      return;
    }

    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  function assignFile(target: ImageTarget, file: File) {
    setError("");

    if (!isImageFile(file)) {
      setError("Please choose or paste an image file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 20 MB.");
      return;
    }

    if (target === "avatar") {
      setAvatarFile(file);
      setRemoveAvatar(false);

      const transfer = new DataTransfer();
      transfer.items.add(file);

      if (avatarInputRef.current) {
        avatarInputRef.current.files = transfer.files;
      }

      return;
    }

    setBannerFile(file);
    setRemoveBanner(false);

    const transfer = new DataTransfer();
    transfer.items.add(file);

    if (bannerInputRef.current) {
      bannerInputRef.current.files = transfer.files;
    }
  }

  function handleFileChange(
    target: ImageTarget,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      assignFile(target, file);
    }
  }

  function handleDrop(
    target: ImageTarget,
    event: DragEvent<HTMLLabelElement>
  ) {
    event.preventDefault();
    setActiveTarget(target);

    const file = Array.from(event.dataTransfer.files).find(
      isImageFile
    );

    if (file) {
      assignFile(target, file);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLFormElement>) {
    const file = Array.from(event.clipboardData.files).find(
      isImageFile
    );

    if (!file) {
      return;
    }

    event.preventDefault();
    assignFile(activeTarget, file);
  }

  function clearSelected(target: ImageTarget) {
    if (target === "avatar") {
      setAvatarFile(null);

      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }

      return;
    }

    setBannerFile(null);

    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  }

  return (
    <form
      action="/api/admin/nsfw/profile"
      method="POST"
      encType="multipart/form-data"
      onPaste={handlePaste}
      className="mt-8 space-y-7 rounded-3xl border border-white/10 bg-black/25 p-6 sm:p-8"
    >
      <label className="block">
        <span className="text-sm font-black">
          NSFW display name
        </span>

        <input
          name="nsfwDisplayName"
          maxLength={50}
          defaultValue={displayName}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-semibold text-white outline-none focus:border-red-400/50"
        />
      </label>

      <label className="block">
        <span className="text-sm font-black">
          NSFW bio
        </span>

        <textarea
          name="nsfwBio"
          rows={5}
          maxLength={280}
          defaultValue={bio}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-semibold text-white outline-none focus:border-red-400/50"
        />

        <span className="mt-2 block text-xs text-zinc-500">
          Maximum 280 characters.
        </span>
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-bold text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-black">NSFW avatar</p>

          {avatarPreview || currentAvatarUrl ? (
            <img
              src={avatarPreview || currentAvatarUrl}
              alt="NSFW avatar preview"
              className="mt-4 h-28 w-28 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Currently using the SFW avatar as a fallback.
            </p>
          )}

          <label
            onClick={() => setActiveTarget("avatar")}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop("avatar", event)}
            className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-red-400/30 bg-red-500/5 px-5 py-6 text-center transition hover:bg-red-500/10"
          >
            <input
              ref={avatarInputRef}
              name="nsfwAvatar"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleFileChange("avatar", event)
              }
              className="sr-only"
            />

            <p className="text-sm font-black text-red-100">
              Click to choose, drag here, or paste an avatar
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Click this box before pasting with Ctrl+V.
            </p>
          </label>

          {avatarFile ? (
            <button
              type="button"
              onClick={() => clearSelected("avatar")}
              className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 hover:bg-white/5"
            >
              Clear selected avatar
            </button>
          ) : null}

          {currentAvatarUrl && !avatarFile ? (
            <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="removeNsfwAvatar"
                value="1"
                checked={removeAvatar}
                onChange={(event) =>
                  setRemoveAvatar(event.target.checked)
                }
              />
              Remove NSFW avatar and use SFW fallback
            </label>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-black">NSFW banner</p>

          {bannerPreview || currentBannerUrl ? (
            <img
              src={bannerPreview || currentBannerUrl}
              alt="NSFW banner preview"
              className="mt-4 aspect-[16/6] w-full rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Currently using the SFW banner as a fallback.
            </p>
          )}

          <label
            onClick={() => setActiveTarget("banner")}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop("banner", event)}
            className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-red-400/30 bg-red-500/5 px-5 py-6 text-center transition hover:bg-red-500/10"
          >
            <input
              ref={bannerInputRef}
              name="nsfwBanner"
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleFileChange("banner", event)
              }
              className="sr-only"
            />

            <p className="text-sm font-black text-red-100">
              Click to choose, drag here, or paste a banner
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Click this box before pasting with Ctrl+V.
            </p>
          </label>

          {bannerFile ? (
            <button
              type="button"
              onClick={() => clearSelected("banner")}
              className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-black text-zinc-200 hover:bg-white/5"
            >
              Clear selected banner
            </button>
          ) : null}

          {currentBannerUrl && !bannerFile ? (
            <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                name="removeNsfwBanner"
                value="1"
                checked={removeBanner}
                onChange={(event) =>
                  setRemoveBanner(event.target.checked)
                }
              />
              Remove NSFW banner and use SFW fallback
            </label>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-purple-600 px-6 py-4 text-base font-black text-white hover:opacity-90"
      >
        Save NSFW profile
      </button>
    </form>
  );
}
