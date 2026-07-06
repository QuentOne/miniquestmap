"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getVisitorId } from "@/lib/visitor";
import { layoutTree } from "@/lib/layout";
import { QuestNode, type QuestFlowNode } from "@/components/quest-node";
import { GlowEdgeComponent, type GlowEdge } from "@/components/glow-edge";
import { NodePanel } from "@/components/node-panel";
import { SuggestDialog } from "@/components/suggest-dialog";
import type { FireCounts, MapRow, NodeRow, ReactionRow } from "@/lib/types";

const nodeTypes = { questNode: QuestNode };
const edgeTypes = { glowEdge: GlowEdgeComponent };

export function MapView({
  map,
  initialNodes,
  initialFireCounts,
  isOwner,
}: {
  map: MapRow;
  initialNodes: NodeRow[];
  initialFireCounts: FireCounts;
  isOwner: boolean;
}) {
  const [nodes, setNodes] = useState<NodeRow[]>(initialNodes);
  const [fireCounts, setFireCounts] = useState<FireCounts>(initialFireCounts);
  const [firedByMe, setFiredByMe] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visitorIdRef = useRef<string>("");

  useEffect(() => {
    visitorIdRef.current = getVisitorId();
  }, []);

  const nodeIds = useMemo(() => nodes.map((n) => n.id), [nodes]);

  useEffect(() => {
    const supabase = createClient();
    const visitorId = getVisitorId();
    if (nodeIds.length === 0) return;

    supabase
      .from("reactions")
      .select("node_id")
      .eq("visitor_id", visitorId)
      .in("node_id", nodeIds)
      .then(({ data }) => {
        if (data) setFiredByMe(new Set(data.map((r) => r.node_id)));
      });
  }, [nodeIds]);

  useEffect(() => {
    const supabase = createClient();

    const reactionsChannel = supabase
      .channel(`reactions-${map.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reactions" },
        (payload) => {
          const row = payload.new as ReactionRow;
          if (!nodeIds.includes(row.node_id)) return;
          setFireCounts((prev) => ({ ...prev, [row.node_id]: (prev[row.node_id] ?? 0) + 1 }));
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "reactions" },
        (payload) => {
          const row = payload.old as ReactionRow;
          if (!nodeIds.includes(row.node_id)) return;
          setFireCounts((prev) => ({
            ...prev,
            [row.node_id]: Math.max(0, (prev[row.node_id] ?? 1) - 1),
          }));
        },
      )
      .subscribe();

    const nodesChannel = supabase
      .channel(`nodes-${map.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "nodes",
          filter: `map_id=eq.${map.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as NodeRow;
            setNodes((prev) => (prev.some((n) => n.id === row.id) ? prev : [...prev, row]));
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as NodeRow;
            setNodes((prev) => prev.map((n) => (n.id === row.id ? row : n)));
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as NodeRow;
            setNodes((prev) => prev.filter((n) => n.id !== row.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
      supabase.removeChannel(nodesChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.id]);

  const handleFire = useCallback(
    (nodeId: string) => {
      const supabase = createClient();
      const visitorId = visitorIdRef.current || getVisitorId();
      const alreadyFired = firedByMe.has(nodeId);

      setFiredByMe((prev) => {
        const next = new Set(prev);
        if (alreadyFired) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
      setFireCounts((prev) => ({
        ...prev,
        [nodeId]: Math.max(0, (prev[nodeId] ?? 0) + (alreadyFired ? -1 : 1)),
      }));

      const run = alreadyFired
        ? supabase.from("reactions").delete().eq("node_id", nodeId).eq("visitor_id", visitorId)
        : supabase.from("reactions").insert({ node_id: nodeId, visitor_id: visitorId });

      run.then(({ error }) => {
        if (!error) {
          if (!alreadyFired) toast.success("Reaction added!");
          return;
        }

        toast.error("Could not update reaction");
        setFiredByMe((prev) => {
          const next = new Set(prev);
          if (alreadyFired) next.add(nodeId);
          else next.delete(nodeId);
          return next;
        });
        setFireCounts((prev) => ({
          ...prev,
          [nodeId]: Math.max(0, (prev[nodeId] ?? 0) + (alreadyFired ? 1 : -1)),
        }));
      });
    },
    [firedByMe],
  );

  const handleToggleComplete = useCallback(
    (nodeId: string, value: boolean) => {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, is_complete: value } : n)));
      const supabase = createClient();
      supabase
        .from("nodes")
        .update({ is_complete: value })
        .eq("id", nodeId)
        .then(({ error }) => {
          if (error) {
            toast.error("Could not update quest status");
            setNodes((prev) =>
              prev.map((n) => (n.id === nodeId ? { ...n, is_complete: !value } : n)),
            );
          }
        });
    },
    [],
  );

  const structuralKey = useMemo(
    () => nodes.map((n) => `${n.id}:${n.parent_id ?? "root"}`).join("|"),
    [nodes],
  );

  const positions = useMemo(() => {
    const baseNodes = nodes.map((n) => ({
      id: n.id,
      position: { x: 0, y: 0 },
      data: {},
    }));
    const baseEdges: Edge[] = nodes
      .filter((n) => n.parent_id)
      .map((n) => ({ id: `${n.parent_id}-${n.id}`, source: n.parent_id!, target: n.id }));
    const laidOut = layoutTree(baseNodes, baseEdges);
    const map = new Map<string, { x: number; y: number }>();
    laidOut.forEach((n) => map.set(n.id, n.position));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuralKey]);

  const flowNodes: QuestFlowNode[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: "questNode",
        position: positions.get(n.id) ?? { x: 0, y: 0 },
        data: {
          title: n.title,
          isRoot: n.parent_id === null,
          isComplete: n.is_complete,
          fireCount: fireCounts[n.id] ?? 0,
          isFiredByMe: firedByMe.has(n.id),
          isSelected: selectedId === n.id,
          onSelect: () => setSelectedId(n.id),
          onFire: () => handleFire(n.id),
        },
        draggable: false,
      })),
    [nodes, positions, fireCounts, firedByMe, selectedId, handleFire],
  );

  const flowEdges: GlowEdge[] = useMemo(
    () =>
      nodes
        .filter((n) => n.parent_id)
        .map((n) => ({
          id: `${n.parent_id}-${n.id}`,
          source: n.parent_id!,
          target: n.id,
          type: "glowEdge",
          data: { isComplete: n.is_complete },
        })),
    [nodes],
  );

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-full bg-background">
      <div className="pointer-events-none absolute left-6 top-6 z-10">
        <p className="text-sm font-medium tracking-wide text-foreground">{map.title}</p>
        <p className="mt-0.5 font-mono text-xs tracking-[0.25em] text-muted-foreground">
          {map.code}
        </p>
      </div>

      <ReactFlowProvider>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onPaneClick={() => setSelectedId(null)}
          fitView
          fitViewOptions={{ padding: 0.4 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#232328" />
          <Controls
            showInteractive={false}
            className="!border-white/10 !bg-card/80 !fill-white [&_button]:!border-white/10 [&_button]:!bg-transparent [&_button]:!text-white"
          />
        </ReactFlow>
      </ReactFlowProvider>

      <NodePanel
        node={selectedNode}
        fireCount={selectedNode ? fireCounts[selectedNode.id] ?? 0 : 0}
        isFiredByMe={selectedNode ? firedByMe.has(selectedNode.id) : false}
        isOwner={isOwner}
        onFire={() => selectedNode && handleFire(selectedNode.id)}
        onToggleComplete={(value) => selectedNode && handleToggleComplete(selectedNode.id, value)}
        onClose={() => setSelectedId(null)}
      />

      <SuggestDialog mapId={map.id} nodes={nodes} />
    </div>
  );
}
