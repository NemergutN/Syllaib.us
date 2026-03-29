"use client";

import { useLayoutEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NodeType = "root" | "area" | "skill" | "action";

export type TreeNode = {
  id: string;
  label: string;
  description?: string;
  type: NodeType;
  children?: TreeNode[];
};

export type KnowledgeMapData = {
  title?: string;
  root: TreeNode;
};

// ── Styles ────────────────────────────────────────────────────────────────────

const NODE_STYLES: Record<NodeType, { base: string; selected: string; dot: string }> = {
  root:   { base: "bg-amber-900 border-amber-900 text-amber-50",  selected: "bg-amber-900 border-amber-900 text-amber-50",  dot: "bg-amber-300" },
  area:   { base: "bg-white border-amber-200 text-amber-800",     selected: "bg-amber-900 border-amber-900 text-amber-50",  dot: "bg-amber-500" },
  skill:  { base: "bg-white border-amber-200 text-amber-800",     selected: "bg-amber-800 border-amber-800 text-amber-50",  dot: "bg-amber-400" },
  action: { base: "bg-white border-green-200 text-green-800",     selected: "bg-green-700 border-green-700 text-green-50",  dot: "bg-green-400" },
};

const MAX_DEPTH = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNodeAtPath(root: TreeNode, path: string[]): TreeNode | null {
  let cur: TreeNode = root;
  for (const id of path) {
    const next = cur.children?.find((c) => c.id === id);
    if (!next) return null;
    cur = next;
  }
  return cur;
}

// ── Node card ─────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  isSelected,
  hasSelectedSibling,
  isLeaf,
  onClick,
}: {
  node: TreeNode;
  isSelected: boolean;
  hasSelectedSibling: boolean;
  isLeaf: boolean;
  onClick: () => void;
}) {
  const styles = NODE_STYLES[node.type];
  const dimmed = hasSelectedSibling && !isSelected;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border p-4 transition-all duration-200
        ${isSelected ? styles.selected : styles.base}
        ${dimmed ? "opacity-35" : "opacity-100"}
        ${!isSelected && !dimmed ? "hover:border-amber-400 hover:shadow-sm active:scale-[0.98]" : ""}
        ${isLeaf ? "cursor-default" : "cursor-pointer"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-snug">{node.label}</span>
        {isLeaf && <span className="text-xs shrink-0 mt-0.5 opacity-70">✓</span>}
      </div>
      {node.description && (
        <p className={`text-xs mt-1.5 leading-snug ${isSelected ? "opacity-75" : "opacity-55"}`}>
          {node.description}
        </p>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeMap({ data }: { data: KnowledgeMapData }) {
  const [path, setPath] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const [arrowPaths, setArrowPaths] = useState<{ d: string; stroke: string; marker: string }[]>([]);

  function setNodeRef(id: string) {
    return (el: HTMLDivElement | null) => {
      if (el) nodeRefs.current.set(id, el);
      else nodeRefs.current.delete(id);
    };
  }

  // ── Arrow computation ───────────────────────────────────────────────────────

  function computeArrows() {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const sl = container.scrollLeft;
    const st = container.scrollTop;
    setSvgSize({ w: container.scrollWidth, h: container.scrollHeight });

    function rightEdge(id: string) {
      const el = nodeRefs.current.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.right - cRect.left + sl, y: r.top - cRect.top + st + r.height / 2 };
    }

    function leftEdge(id: string) {
      const el = nodeRefs.current.get(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left - cRect.left + sl, y: r.top - cRect.top + st + r.height / 2 };
    }

    function bezier(from: { x: number; y: number }, to: { x: number; y: number }) {
      const cx = from.x + (to.x - from.x) * 0.5;
      return `M ${from.x} ${from.y} C ${cx} ${from.y} ${cx} ${to.y} ${to.x} ${to.y}`;
    }

    const paths: typeof arrowPaths = [];

    function addArrows(parentId: string, children: TreeNode[], stroke: string, marker: string) {
      const from = rightEdge(parentId);
      if (!from) return;
      for (const child of children) {
        const to = leftEdge(child.id);
        if (!to) continue;
        paths.push({ d: bezier(from, to), stroke, marker });
      }
    }

    // Root → its children (always visible)
    if (data.root.children?.length) {
      addArrows(data.root.id, data.root.children, "#d97706", "url(#arrow-amber)");
    }

    // Selected L1 → its children
    if (path[0]) {
      const l1 = data.root.children?.find((c) => c.id === path[0]);
      if (l1?.children?.length) {
        addArrows(l1.id, l1.children, "#b45309", "url(#arrow-dark)");
      }
    }

    // Selected L2 → its children
    if (path[0] && path[1]) {
      const l1 = data.root.children?.find((c) => c.id === path[0]);
      const l2 = l1?.children?.find((c) => c.id === path[1]);
      if (l2?.children?.length) {
        addArrows(l2.id, l2.children, "#16a34a", "url(#arrow-green)");
      }
    }

    setArrowPaths(paths);
  }

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(computeArrows);
    return () => cancelAnimationFrame(raf);
  });

  // ── Column building ─────────────────────────────────────────────────────────

  const columns: { nodes: TreeNode[]; depth: number }[] = [];
  columns.push({ nodes: [data.root], depth: 0 });

  if ((data.root.children?.length ?? 0) > 0) {
    columns.push({ nodes: data.root.children!, depth: 1 });
  }
  for (let d = 0; d < path.length && d < MAX_DEPTH - 1; d++) {
    const parent = getNodeAtPath(data.root, path.slice(0, d + 1));
    if (parent && (parent.children?.length ?? 0) > 0) {
      columns.push({ nodes: parent.children!, depth: d + 2 });
    }
  }

  const deepestSelected = path.length > 0 ? getNodeAtPath(data.root, path) : null;
  const atMaxDepth = path.length >= MAX_DEPTH;
  const showComplete = deepestSelected && (atMaxDepth || (deepestSelected.children?.length ?? 0) === 0);

  function handleSelect(depth: number, nodeId: string) {
    setPath((prev) => {
      const trimmed = prev.slice(0, depth);
      if (prev[depth] === nodeId) return trimmed;
      return [...trimmed, nodeId];
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="bg-white border border-amber-200 rounded-2xl p-6 overflow-x-auto relative">
      {data.title && (
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400 mb-5">{data.title}</p>
      )}

      {/* SVG arrow overlay */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={svgSize.w}
        height={svgSize.h}
        style={{ zIndex: 0 }}
      >
        <defs>
          <marker id="arrow-amber" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#d97706" opacity="0.55" />
          </marker>
          <marker id="arrow-dark" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#b45309" opacity="0.55" />
          </marker>
          <marker id="arrow-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0,8 3,0 6" fill="#16a34a" opacity="0.55" />
          </marker>
        </defs>
        {arrowPaths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke={p.stroke}
            strokeWidth="1.5"
            strokeOpacity="0.45"
            fill="none"
            markerEnd={p.marker}
          />
        ))}
      </svg>

      {/* Node columns */}
      <div className="flex gap-16 min-w-max items-start relative" style={{ zIndex: 1 }}>
        {columns.map(({ nodes, depth }) => {
          const selectedAtThisDepth = depth === 0 ? null : path[depth - 1];

          return (
            <div key={depth} className="flex flex-col gap-3 w-52">
              {nodes.map((node) => {
                const isSelected = depth === 0 || node.id === selectedAtThisDepth;
                const hasSelectedSibling = depth > 0 && !!selectedAtThisDepth && !isSelected;
                const isLeaf = (node.children?.length ?? 0) === 0 || depth >= MAX_DEPTH;

                return (
                  <div key={node.id} ref={setNodeRef(node.id)}>
                    <NodeCard
                      node={node}
                      isSelected={isSelected}
                      hasSelectedSibling={hasSelectedSibling}
                      isLeaf={isLeaf}
                      onClick={() => { if (depth > 0) handleSelect(depth - 1, node.id); }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Path complete */}
        {showComplete && (
          <div className="w-44 rounded-2xl border border-green-200 bg-green-50 p-4 flex flex-col gap-1.5 self-center">
            <span className="text-green-700 font-semibold text-sm">Path complete</span>
            <p className="text-green-600 text-xs leading-snug">
              {atMaxDepth
                ? "You've reached the end of this branch. Explore others!"
                : "This is a concrete action. Start here!"}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-amber-100" style={{ position: "relative", zIndex: 1 }}>
        {(["root", "area", "skill", "action"] as NodeType[]).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${NODE_STYLES[t].dot}`} />
            <span className="text-xs text-amber-500 capitalize">{t}</span>
          </div>
        ))}
        <span className="text-xs text-amber-300 ml-auto">Click nodes to explore</span>
      </div>
    </div>
  );
}
