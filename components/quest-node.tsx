"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuestNodeData = {
  title: string;
  isRoot: boolean;
  isComplete: boolean;
  fireCount: number;
  isFiredByMe: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onFire: () => void;
};

export type QuestFlowNode = Node<QuestNodeData, "questNode">;

function QuestNodeComponent({ data }: NodeProps<QuestFlowNode>) {
  const { title, isRoot, isComplete, fireCount, isFiredByMe, isSelected, onSelect, onFire } =
    data;

  const size = isRoot ? "size-[168px]" : "size-[120px]";

  return (
    <motion.div
      className="relative flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-full text-center transition-shadow duration-300",
          size,
          isComplete
            ? "bg-[var(--quest-green)]/15 ring-1 ring-[var(--quest-green)]/70 shadow-[0_0_36px_var(--quest-green-glow)]"
            : "bg-[var(--quest-grey)]/20 ring-1 ring-[var(--quest-grey-ring)]",
          isSelected && "ring-2 ring-white/70",
        )}
      >
        <span
          className={cn(
            "pointer-events-none px-4 text-sm font-medium leading-snug letter-spaced text-balance",
            isComplete ? "text-emerald-100" : "text-zinc-200",
          )}
        >
          {title}
        </span>

        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs text-white opacity-0 backdrop-blur transition-opacity duration-150 group-hover:opacity-100">
          {title}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFire();
        }}
        className={cn(
          "nodrag absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium backdrop-blur transition-colors",
          isFiredByMe
            ? "border-orange-400/60 bg-orange-500/20 text-orange-200"
            : "border-white/15 bg-black/60 text-zinc-300 hover:border-white/30",
        )}
      >
        <Flame
          key={isFiredByMe ? "on" : "off"}
          className={cn("size-3.5", isFiredByMe ? "animate-fire-pop fill-orange-400 text-orange-400" : "")}
        />
        {fireCount}
      </button>
    </motion.div>
  );
}

export const QuestNode = memo(QuestNodeComponent);
