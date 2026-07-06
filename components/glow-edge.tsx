"use client";

import { getSmoothStepPath, type EdgeProps, type Edge } from "@xyflow/react";

export type GlowEdgeData = { isComplete: boolean };
export type GlowEdge = Edge<GlowEdgeData, "glowEdge">;

export function GlowEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<GlowEdge>) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 24,
  });

  const isComplete = Boolean(data?.isComplete);
  const color = isComplete ? "#34d399" : "#9ca3af";

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeOpacity={0.25}
        style={{ filter: "blur(4px)" }}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.7}
        strokeDasharray="6 6"
        style={{ animation: "dash-flow 900ms linear infinite" }}
      />
    </g>
  );
}
