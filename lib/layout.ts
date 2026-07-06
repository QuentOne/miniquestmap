import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

const ROOT_WIDTH = 168;
const ROOT_HEIGHT = 168;
const NODE_WIDTH = 120;
const NODE_HEIGHT = 120;

export function layoutTree<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
): Node<T>[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 56, ranksep: 96 });

  for (const node of nodes) {
    const isRoot = !edges.some((e) => e.target === node.id);
    const size = isRoot
      ? { width: ROOT_WIDTH, height: ROOT_HEIGHT }
      : { width: NODE_WIDTH, height: NODE_HEIGHT };
    g.setNode(node.id, size);
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const isRoot = !edges.some((e) => e.target === node.id);
    const width = isRoot ? ROOT_WIDTH : NODE_WIDTH;
    const height = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    };
  });
}

export { NODE_WIDTH, NODE_HEIGHT, ROOT_WIDTH, ROOT_HEIGHT };
