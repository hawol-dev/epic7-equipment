interface SlotIconProps {
  slot: "necklace" | "ring" | "boots";
  size?: number;
}

export function SlotIcon({ slot, size = 16 }: SlotIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (slot === "necklace") {
    return (
      <svg {...common}>
        <path d="M3 3 Q8 11 13 3" />
        <circle cx="8" cy="12" r="1.5" />
      </svg>
    );
  }
  if (slot === "ring") {
    return (
      <svg {...common}>
        <circle cx="8" cy="10" r="4" />
        <path d="M6 5 L8 3 L10 5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 3 V9 H11 V11 L13 12 L13 9 L11 8 V3 Z" />
    </svg>
  );
}
