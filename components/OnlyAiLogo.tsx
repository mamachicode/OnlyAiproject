import Link from "next/link";

type OnlyAiLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
};

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

function NeonAi({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-block text-pink-300 ${className}`}
      style={{
        color: "#ff5fc8",
        WebkitTextStroke: "1px rgba(255, 210, 244, 0.9)",
        textShadow:
          "0 0 6px rgba(255, 95, 200, 0.95), 0 0 18px rgba(255, 95, 200, 0.75), 0 0 36px rgba(217, 70, 239, 0.55)",
      }}
    >
      Ai
    </span>
  );
}

export default function OnlyAiLogo({
  href = "/",
  size = "md",
  showIcon = false,
  className = "",
}: OnlyAiLogoProps) {
  const content = (
    <span
      className={`inline-flex items-center font-black tracking-[-0.07em] ${sizeMap[size]} ${className}`}
      aria-label="OnlyAi"
    >
      <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]">
        Only
      </span>
      <NeonAi />
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}

export { NeonAi };
