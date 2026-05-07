"use client";

import { useEffect, useMemo, useState } from "react";

type MediaType = "IMAGE" | "VIDEO";

type GalleryMedia = {
  src: string;
  type: MediaType;
  alt: string;
};

type MediaLightboxProps = {
  media: GalleryMedia[];
  initialIndex?: number;
};

export default function MediaLightbox({
  media,
  initialIndex = 0,
}: MediaLightboxProps) {
  const cleanMedia = useMemo(
    () => media.filter((item) => item?.src),
    [media]
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const activeMedia = cleanMedia[activeIndex];
  const hasMultiple = cleanMedia.length > 1;

  function openViewer() {
    setActiveIndex(initialIndex);
    setOpen(true);
  }

  function closeViewer() {
    setOpen(false);
  }

  function goPrevious() {
    if (!hasMultiple) return;
    setActiveIndex((current) =>
      current === 0 ? cleanMedia.length - 1 : current - 1
    );
  }

  function goNext() {
    if (!hasMultiple) return;
    setActiveIndex((current) =>
      current === cleanMedia.length - 1 ? 0 : current + 1
    );
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, hasMultiple, cleanMedia.length]);

  if (!cleanMedia.length) return null;

  const preview = cleanMedia[initialIndex] || cleanMedia[0];

  return (
    <>
      <button
        type="button"
        onClick={openViewer}
        className="group relative h-full w-full cursor-zoom-in overflow-hidden"
        aria-label="Open media full screen"
      >
        {preview.type === "VIDEO" ? (
          <video
            src={preview.src}
            muted
            playsInline
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-90"
          />
        ) : (
          <img
            src={preview.src}
            alt={preview.alt}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-90"
          />
        )}

        <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-black/0 p-4 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          {hasMultiple ? (
            <span className="rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white backdrop-blur">
              {cleanMedia.length} items
            </span>
          ) : (
            <span />
          )}

          <span className="rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white backdrop-blur">
            Click to enlarge
          </span>
        </div>
      </button>

      {open && activeMedia ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={closeViewer}
        >
          <button
            type="button"
            onClick={closeViewer}
            className="absolute right-5 top-5 z-20 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
            aria-label="Close media viewer"
          >
            ✕
          </button>

          {hasMultiple ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrevious();
                }}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 px-5 py-4 text-3xl font-black text-white hover:bg-white/20"
                aria-label="Previous media"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 px-5 py-4 text-3xl font-black text-white hover:bg-white/20"
                aria-label="Next media"
              >
                ›
              </button>

              <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                {activeIndex + 1} / {cleanMedia.length}
              </div>
            </>
          ) : null}

          <div
            className="max-h-[92vh] max-w-[96vw]"
            onClick={(event) => event.stopPropagation()}
          >
            {activeMedia.type === "VIDEO" ? (
              <video
                src={activeMedia.src}
                controls
                autoPlay
                className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain"
              />
            ) : (
              <img
                src={activeMedia.src}
                alt={activeMedia.alt}
                className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain"
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
