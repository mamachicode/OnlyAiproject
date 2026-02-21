"use client";


type Props = {
  postId: string;
  title: string;
  handle: string;
  isLocked: boolean;
  mediaType: "IMAGE" | "VIDEO";
  displayUrl: string;
};

export default function NsfwCard({
  postId,
  title,
  handle,
  isLocked,
  mediaType,
  displayUrl,
}: Props) {


  return (
    <div
      
      className="bg-neutral-900 rounded-xl overflow-hidden shadow hover:scale-[1.02] transition "
    >
      {/* Media Wrapper */}
      <div className="relative">
        {mediaType === "IMAGE" ? (
          <img
            src={displayUrl}
            className="w-full h-64 object-cover"
          />
        ) : (
          <video
            src={displayUrl}
            className="w-full h-64 object-cover"
            controls={!isLocked}
          />
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-sm font-semibold text-white">
                Locked Content
              </p>
              <p className="text-xs text-neutral-300 mt-1">
                Subscribe to unlock
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <p className="text-sm font-semibold text-white truncate">
          {title}
        </p>
        <p className="text-xs text-neutral-400">
          @{handle}
        </p>
      </div>
    </div>
  );
}
