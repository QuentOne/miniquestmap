"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const digitAnimation = (delay: number) => ({
  y: [0, -22, 0, 12, 0],
  rotate: [0, -12, 0, 10, 0],
  scale: [1, 1.15, 1, 0.92, 1],
  transition: {
    duration: 1.1,
    delay,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
});

export function SixSevenDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium tracking-wide text-foreground transition-transform hover:scale-110 active:scale-95"
        aria-label="67"
      >
        67
      </button>

      <DialogContent className="flex max-w-xs flex-col items-center gap-6 border-white/10 bg-card/95 py-10 sm:max-w-xs">
        <DialogTitle className="sr-only">67</DialogTitle>
        <div className="flex items-center gap-8 text-7xl font-semibold tabular-nums">
          <motion.span animate={digitAnimation(0)} className="inline-block text-foreground">
            6
          </motion.span>
          <motion.span animate={digitAnimation(0.25)} className="inline-block text-foreground">
            7
          </motion.span>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          the algorithm demands it
        </p>
      </DialogContent>
    </Dialog>
  );
}
