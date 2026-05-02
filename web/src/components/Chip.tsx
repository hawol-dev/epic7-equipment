"use client";

interface ChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** 선택됐을 때 사용할 액센트 컬러 (속성/등급 등) */
  accent?: string;
  size?: "sm" | "md";
  title?: string;
}

export function Chip({
  label,
  selected,
  onToggle,
  accent,
  size = "md",
  title,
}: ChipProps) {
  const padding =
    size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs";

  // 선택 시 스타일 — 명확하게 구분되도록 채워진 배경 사용
  let selectedStyle: React.CSSProperties | undefined;
  let selectedClass = "";

  if (selected) {
    if (accent) {
      // 액센트 컬러 칩 (속성/등급): 컬러 채움 + 검은 텍스트
      selectedStyle = {
        backgroundColor: accent,
        borderColor: accent,
        color: "var(--text-inverse)",
      };
    } else {
      // 일반 칩: 흰색에 가까운 채움 + 검은 텍스트
      selectedClass =
        "bg-[var(--text-primary)] text-[var(--text-inverse)] border-[var(--text-primary)] font-medium";
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={title ?? label}
      aria-pressed={selected}
      className={
        "inline-flex items-center rounded-sm border transition-colors select-none cursor-pointer " +
        padding +
        (selected
          ? " " + selectedClass
          : " text-[var(--text-secondary)] border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]")
      }
      style={selectedStyle}
    >
      {label}
    </button>
  );
}
