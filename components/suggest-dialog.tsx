"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { NodeRow } from "@/lib/types";

export function SuggestDialog({ mapId, nodes }: { mapId: string; nodes: NodeRow[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>(
    nodes.find((n) => n.parent_id === null)?.id ?? "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.from("suggestions").insert({
      map_id: mapId,
      parent_node_id: parentId || null,
      title: title.trim(),
      description: description.trim(),
    });

    setLoading(false);
    if (error) {
      toast.error("Could not send suggestion: " + error.message);
      return;
    }

    toast.success("Suggestion sent!");
    setTitle("");
    setDescription("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06 }}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-white text-black shadow-[0_0_30px_-4px_rgba(255,255,255,0.5)]"
        aria-label="Suggest a challenge"
      >
        <Plus className="size-6" />
      </motion.button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggest a challenge</DialogTitle>
          <DialogDescription>
            Propose a new quest node. The map owner will review it before it
            appears.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggest-title">Title</Label>
            <Input
              id="suggest-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Defeat the shadow knight"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suggest-description">Description</Label>
            <Textarea
              id="suggest-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this quest involve?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Branches from</Label>
            <Select value={parentId} onValueChange={(value) => setParentId(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a node" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.parent_id === null ? `${n.title} (root)` : n.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send suggestion"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
