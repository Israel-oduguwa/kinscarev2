"use client";
import Image from "next/image";
import * as React from "react";

type JobListingLogoProps = {
  src?: string | null;
  alt?: string;
  /** What to base the gradient/initials on (e.g., employer or job title) */
  seed?: string;
  /** Pixel size of the square/circle avatar */
  size?: number;
  /** Shape control; set to "full" for a circular avatar */
  rounded?: "full" | "2xl" | "xl" | "lg" | "md";
  className?: string;
};

const hashString = (str: string) => {
  // FNV-1a (32-bit)
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  // force unsigned
  return h >>> 0;
};

const gradientFromString = (seed: string) => {
  const h = hashString(seed || "kinscare");
  let h1 = h % 360;
  let h2 = (h >> 5) % 360;
  if (Math.abs(h1 - h2) < 35) h2 = (h1 + 60) % 360;

  const c1 = `hsl(${h1} 85% 56%)`;
  const c2 = `hsl(${h2} 85% 46%)`;
  return {
    background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
  };
};

const getInitials = (str: string) => {
  const cleaned = (str || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1][0] ?? "" : cleaned[1] ?? "";
  return (first + second).toUpperCase();
};

const shapeClass = (rounded: JobListingLogoProps["rounded"]) => {
  switch (rounded) {
    case "full":
      return "rounded-full";
    case "xl":
      return "rounded-xl";
    case "lg":
      return "rounded-lg";
    case "md":
      return "rounded-md";
    default:
      return "rounded-2xl";
  }
};

const JobListingLogo: React.FC<JobListingLogoProps> = ({
  src,
  alt = "logo",
  seed,
  size = 56,
  rounded = "2xl",
  className = "",
}) => {
  const [imgOk, setImgOk] = React.useState<boolean>(!!src);

  const fallbackSeed = (seed || alt || "KinsCare").trim();
  const initials = React.useMemo(() => getInitials(fallbackSeed), [fallbackSeed]);
  const grad = React.useMemo(() => gradientFromString(fallbackSeed), [fallbackSeed]);

  return (
    <div
      className={`relative overflow-hidden ring-1 ring-black/5 ${shapeClass(rounded)} ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
      role="img"
    >
      {src && imgOk ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setImgOk(false)}
          priority={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center" style={{ background: grad.background }}>
          {/* <span
            className="select-none text-white/95"
            style={{
              fontSize: Math.max(12, Math.floor(size * 0.36)),
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {initials}
          </span> */}
        </div>
      )}
    </div>
  );
};

export default JobListingLogo;
