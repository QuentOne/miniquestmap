"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { acceptSuggestion, rejectSuggestion } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import type { NodeRow, SuggestionRow } from "@/lib/types";

export function SuggestionsInbox({
  mapId,
  initialSuggestions,
  nodes,
}: {
  mapId: string;
  initialSuggestions: SuggestionRow[];
  nodes: NodeRow[];
}) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`suggestions-${mapId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "suggestions",
          filter: `map_id=eq.${mapId}`,
        },
        (payload) => {
          const row = payload.new as SuggestionRow;
          setSuggestions((prev) => [row, ...prev]);
          toast.info(`New suggestion: "${row.title}"`);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "suggestions",
          filter: `map_id=eq.${mapId}`,
        },
        (payload) => {
          const row = payload.new as SuggestionRow;
          setSuggestions((prev) =>
            row.status === "pending"
              ? prev.map((s) => (s.id === row.id ? row : s))
              : prev.filter((s) => s.id !== row.id),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapId]);

  const pending = suggestions.filter((s) => s.status === "pending");

  function parentTitle(parentNodeId: string | null) {
    if (!parentNodeId) return "Root";
    return nodes.find((n) => n.id === parentNodeId)?.title ?? "Root";
  }

  function handleAccept(s: SuggestionRow) {
    setBusyId(s.id);
    startTransition(async () => {
      try {
        await acceptSuggestion(s.id, mapId, s.parent_node_id, s.title, s.description);
        setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
        toast.success("Suggestion accepted — node added to the map");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to accept suggestion");
      } finally {
        setBusyId(null);
      }
    });
  }

  function handleReject(s: SuggestionRow) {
    setBusyId(s.id);
    startTransition(async () => {
      try {
        await rejectSuggestion(s.id, mapId);
        setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
        toast("Suggestion rejected");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reject suggestion");
      } finally {
        setBusyId(null);
      }
    });
  }

  if (pending.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
        <p className="text-muted-foreground">No pending suggestions.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          New suggestions will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {pending.map((s) => (
          <motion.li
            key={s.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-white/10 bg-card/60 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                {s.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                )}
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Branches from {parentTitle(s.parent_node_id)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending && busyId === s.id}
                  onClick={() => handleReject(s)}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={isPending && busyId === s.id}
                  onClick={() => handleAccept(s)}
                >
                  Accept
                </Button>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
