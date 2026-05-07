"use client";

import { useEffect, useState } from "react";

type MediaType = "IMAGE" | "VIDEO";

type MediaLightboxProps = {
  src: string;
  type: MediaType;
  alt: string;
};

export default function MediaLightbox({ src, type, alt }: MediaLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative h-full w-full cursor-zoom-in overflow-hidden"
        aria-label="Open media full screen"
      >
        {type === "VIDEO" ? (
          <video
            src={src}
            muted
            playsInline
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-90"
          />
        ) : (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:opacity-90"
          />
        )}

        <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-black/0 p-4 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white backdrop-blur">
            Click to enlarge
          </span>
        </div>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
            aria-label="Close media viewer"
          >
            ✕
          </button>

          <div
            className="max-h-[92vh] max-w-[96vw]"
            onClick={(event) => event.stopPropagation()}
          >
            {type === "VIDEO" ? (
              <video
                src={src}
                controls
                autoPlay
                className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain"
              />
            ) : (
              <img
                src={src}
                alt={alt}
                className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain"
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
