"use client"
import React, { useState } from "react";
import clsx from "clsx"; // For class merging
import Image from "next/image";

interface GradientAvatarProps {
  name?: string; // Optional name
  profileImage?: string;
  size?: string; // Tailwind size classes like "w-16 h-16"
}

const stringToColor = (name: string): string[] => {
  let hash = 0;

  // Generate a hash from the name (fallback if name is empty is already handled)
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Create three HSL-based colors from the hash, ensuring darker shades for better contrast
  const hexValues = [];
  for (let i = 0; i < 3; i++) {
    hexValues[i] = (hash >> (i * 8)) & 0xff;
  }

  const hue = (hexValues[0] / 255) * 360;
  const saturation = (hexValues[1] / 255) * 50 + 30; // Saturation: 30-80%
  const lightness = (hexValues[2] / 255) * 20 + 30; // Lightness: 30-50% for darker tones

  const color1 = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness - 10}%)`;
  const color3 = `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness - 20}%)`;

  return [color1, color2, color3];
};

const GradientAvatar: React.FC<GradientAvatarProps> = ({
  name = "User", // Fallback name
  profileImage,
  size = "w-16 h-16",
}) => {
  // Handle initials safely with fallback
  const initials = name
    .trim() // Remove leading/trailing whitespace
    .split(" ") // Split name into words
    .map((word) => word[0]) // Get the first letter of each word
    .join("") // Join initials
    .toUpperCase(); // Convert to uppercase

  // Default gradient colors if name is invalid
  const colors = stringToColor(name || "User");

  const [imageError, setImageError] = useState(false);

  return profileImage && !imageError ? (
    // Render profile image if available
    <div className={`${size} relative`}>
      <Image
        fill
        className={clsx("rounded-full flex-shrink-0")}
        src={profileImage}
        alt={`${name}'s profile`}
        onError={() => setImageError(true)}
      />
    </div>
  ) : (
    // Render gradient avatar with initials if no image is available
    <div
      className={clsx(
        "rounded-full flex items-center justify-center font-bold text-white text-md transition-transform duration-200 hover:scale-105",
        size
      )}
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        boxShadow: `0 1px 2px rgba(0, 0, 0, 0.2)`,
      }}
    >
      {initials || "?"}
    </div>
  );
};

export default GradientAvatar;
