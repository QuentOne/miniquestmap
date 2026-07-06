"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Pencil, Trash2 } from "lucide-react";
import { FireButton } from "@/components/fire-button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { NodeRow } from "@/lib/types";

export function NodePanel({
  node,
  fireCount,
  isFiredByMe,
  isOwner,
  descendantCount,
  onFire,
  onToggleComplete,
  onEdit,
  onDelete,
  onClose,
}: {
  node: NodeRow | null;
  fireCount: number;
  isFiredByMe: boolean;
  isOwner: boolean;
  descendantCount: number;
  onFire: () => void;
  onToggleComplete: (value: boolean) => void;
  onEdit: (title: string, description: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [lastNodeId, setLastNodeId] = useState<string | null>(null);

  if (node && node.id !== lastNodeId) {
    setLastNodeId(node.id);
    setIsEditing(false);
    setConfirmingDelete(false);
    setEditTitle(node.title);
    setEditDescription(node.description);
  }

  const isRoot = node?.parent_id === null;

  function handleSave() {
    if (!editTitle.trim()) return;
    onEdit(editTitle.trim(), editDescription.trim());
    setIsEditing(false);
  }

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
            <div className="absolute right-4 top-4 flex items-center gap-1">
              {isOwner && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Edit quest"
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {!isEditing && (
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
            )}

            {isEditing ? (
              <div className="mt-3 space-y-3 pr-6">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Quest title"
                  autoFocus
                />
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What does this quest involve?"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="flex-1">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mt-3 pr-10 text-lg font-medium tracking-tight text-foreground">
                  {node.title}
                </h2>
                <p className="mt-2 max-h-40 overflow-y-auto text-sm leading-relaxed text-muted-foreground">
                  {node.description || "No description yet."}
                </p>
              </>
            )}

            {!isEditing && (
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
            )}

            {isOwner && !isEditing && !isRoot && (
              <div className="mt-4 border-t border-white/10 pt-4">
                {confirmingDelete ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Delete this quest
                      {descendantCount > 0
                        ? ` and its ${descendantCount} sub-quest${descendantCount === 1 ? "" : "s"}`
                        : ""}
                      ?
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setConfirmingDelete(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="destructive" onClick={onDelete}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete quest
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
