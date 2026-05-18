import Link from "next/link";

type OnlyAiLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
};

const sizeMap = {
  sm: {
    icon: "h-8 w-8",
    text: "text-2xl",
    gap: "gap-2",
  },
  md: {
    icon: "h-10 w-10",
    text: "text-4xl",
    gap: "gap-3",
  },
  lg: {
    icon: "h-12 w-12",
    text: "text-5xl",
    gap: "gap-3",
  },
};

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-fuchsia-500 to-purple-600 shadow-lg shadow-pink-950/25 ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_26%),radial-gradient(circle_at_75%_80%,rgba(255,255,255,0.18),transparent_32%)]" />
      <span className="relative text-lg font-black tracking-tight text-white">
        Ai
      </span>
    </span>
  );
}

export default function OnlyAiLogo({
  href = "/",
  size = "md",
  showIcon = true,
  className = "",
}: OnlyAiLogoProps) {
  const sizes = sizeMap[size];

  const content = (
    <span className={`inline-flex items-center ${sizes.gap} ${className}`}>
      {showIcon ? <LogoMark className={sizes.icon} /> : null}

      <span
        className={`${sizes.text} font-black tracking-[-0.06em] text-white`}
        aria-label="OnlyAi"
      >
        Only<span className="bg-gradient-to-r from-pink-400 to-fuchsia-300 bg-clip-text text-transparent">Ai</span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
