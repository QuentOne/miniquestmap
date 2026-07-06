"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { FireButton } from "@/components/fire-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { NodeRow } from "@/lib/types";

export function NodePanel({
  node,
  fireCount,
  isFiredByMe,
  isOwner,
  onFire,
  onToggleComplete,
  onClose,
}: {
  node: NodeRow | null;
  fireCount: number;
  isFiredByMe: boolean;
  isOwner: boolean;
  onFire: () => void;
  onToggleComplete: (value: boolean) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-card/95 p-6 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:inset-x-auto sm:right-6"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                node.is_complete
                  ? "bg-[var(--quest-green)]/15 text-emerald-300"
                  : "bg-[var(--quest-grey)]/25 text-zinc-300",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  node.is_complete ? "bg-emerald-400" : "bg-zinc-400",
                )}
              />
              {node.is_complete ? "Complete" : "Incomplete"}
            </span>

            <h2 className="mt-3 pr-6 text-lg font-medium tracking-tight text-foreground">
              {node.title}
            </h2>
            <p className="mt-2 max-h-40 overflow-y-auto text-sm leading-relaxed text-muted-foreground">
              {node.description || "No description yet."}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4">
              <FireButton count={fireCount} active={isFiredByMe} onToggle={onFire} />

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="complete-toggle" className="text-xs text-muted-foreground">
                    Mark complete
                  </Label>
                  <Switch
                    id="complete-toggle"
                    checked={node.is_complete}
                    onCheckedChange={onToggleComplete}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
