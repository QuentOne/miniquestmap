"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function FireButton({
  count,
  active,
  onToggle,
  size = "md",
}: {
  count: number;
  active: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium transition-colors",
        size === "md" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs",
        active
          ? "border-orange-400/60 bg-orange-500/15 text-orange-200"
          : "border-white/15 bg-white/5 text-zinc-300 hover:border-white/30",
      )}
    >
      <Flame
        key={active ? "on" : "off"}
        className={cn(
          size === "md" ? "size-4" : "size-3.5",
          active ? "animate-fire-pop fill-orange-400 text-orange-400" : "",
        )}
      />
      {count}
    </button>
  );
}
