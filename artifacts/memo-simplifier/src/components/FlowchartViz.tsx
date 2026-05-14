import { useMemo } from "react";

export interface FlowNode {
  id: string;
  label: string;
  type: "start" | "action" | "decision" | "end";
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartData {
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const NODE_W = 168;
const NODE_H = 52;
const DIAMOND_R = 46;
const LAYER_GAP = 110;
const COL_GAP = 48;
const PAD = 32;

interface PositionedNode extends FlowNode {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

function layoutNodes(nodes: FlowNode[], edges: FlowEdge[]): PositionedNode[] {
  const inCount = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  edges.forEach((e) => inCount.set(e.to, (inCount.get(e.to) ?? 0) + 1));

  const adj = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => adj.get(e.from)?.push(e.to));

  const layers = new Map<string, number>();
  const queue: string[] = [];
  nodes.forEach((n) => {
    if (n.type === "start" || inCount.get(n.id) === 0) {
      layers.set(n.id, 0);
      queue.push(n.id);
    }
  });
  if (queue.length === 0 && nodes.length > 0) {
    layers.set(nodes[0]!.id, 0);
    queue.push(nodes[0]!.id);
  }

  let qi = 0;
  while (qi < queue.length) {
    const curr = queue[qi++]!;
    const currLayer = layers.get(curr) ?? 0;
    adj.get(curr)?.forEach((next) => {
      const proposed = currLayer + 1;
      if (!layers.has(next) || layers.get(next)! < proposed) {
        layers.set(next, proposed);
        queue.push(next);
      }
    });
  }
  nodes.forEach((n) => {
    if (!layers.has(n.id)) layers.set(n.id, 0);
  });

  const layerGroups = new Map<number, string[]>();
  nodes.forEach((n) => {
    const l = layers.get(n.id)!;
    if (!layerGroups.has(l)) layerGroups.set(l, []);
    layerGroups.get(l)!.push(n.id);
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const result: PositionedNode[] = [];

  layerGroups.forEach((ids, layer) => {
    const total = ids.length * NODE_W + (ids.length - 1) * COL_GAP;
    ids.forEach((id, i) => {
      const node = nodeMap.get(id)!;
      const cx = -total / 2 + i * (NODE_W + COL_GAP) + NODE_W / 2;
      const cy = layer * LAYER_GAP;
      result.push({ ...node, x: cx - NODE_W / 2, y: cy - NODE_H / 2, cx, cy });
    });
  });

  return result;
}

function nodeColor(type: FlowNode["type"]) {
  switch (type) {
    case "start":
      return { fill: "hsl(var(--primary))", text: "hsl(var(--primary-foreground))", stroke: "none" };
    case "end":
      return { fill: "hsl(var(--primary) / 0.15)", text: "hsl(var(--foreground))", stroke: "hsl(var(--primary))" };
    case "decision":
      return { fill: "hsl(var(--secondary))", text: "hsl(var(--secondary-foreground))", stroke: "none" };
    default:
      return { fill: "hsl(var(--card))", text: "hsl(var(--foreground))", stroke: "hsl(var(--border))" };
  }
}

function wrapText(text: string, maxChars = 20): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function NodeShape({ node }: { node: PositionedNode }) {
  const colors = nodeColor(node.type);
  const lines = wrapText(node.label);
  const lineH = 16;
  const textY = node.cy - ((lines.length - 1) * lineH) / 2;

  if (node.type === "decision") {
    const r = DIAMOND_R;
    const pts = `${node.cx},${node.cy - r} ${node.cx + r},${node.cy} ${node.cx},${node.cy + r} ${node.cx - r},${node.cy}`;
    return (
      <g>
        <polygon points={pts} fill={colors.fill} stroke={colors.stroke === "none" ? "transparent" : colors.stroke} strokeWidth={1.5} />
        {lines.map((l, i) => (
          <text
            key={i}
            x={node.cx}
            y={textY + i * lineH}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.text}
            fontSize={11}
            fontWeight="500"
            fontFamily="inherit"
          >
            {l}
          </text>
        ))}
      </g>
    );
  }

  const rx = node.type === "start" || node.type === "end" ? 26 : 8;
  return (
    <g>
      <rect
        x={node.cx - NODE_W / 2}
        y={node.cy - NODE_H / 2}
        width={NODE_W}
        height={NODE_H}
        rx={rx}
        fill={colors.fill}
        stroke={colors.stroke === "none" ? "transparent" : colors.stroke}
        strokeWidth={1.5}
      />
      {lines.map((l, i) => (
        <text
          key={i}
          x={node.cx}
          y={textY + i * lineH}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={colors.text}
          fontSize={12}
          fontWeight={node.type === "start" || node.type === "end" ? "600" : "400"}
          fontFamily="inherit"
        >
          {l}
        </text>
      ))}
    </g>
  );
}

function edgePort(node: PositionedNode, dir: "top" | "bottom" | "left" | "right") {
  const r = node.type === "decision" ? DIAMOND_R : 0;
  switch (dir) {
    case "bottom":
      return node.type === "decision"
        ? { x: node.cx, y: node.cy + r }
        : { x: node.cx, y: node.cy + NODE_H / 2 };
    case "top":
      return node.type === "decision"
        ? { x: node.cx, y: node.cy - r }
        : { x: node.cx, y: node.cy - NODE_H / 2 };
    case "left":
      return node.type === "decision"
        ? { x: node.cx - r, y: node.cy }
        : { x: node.cx - NODE_W / 2, y: node.cy };
    case "right":
      return node.type === "decision"
        ? { x: node.cx + r, y: node.cy }
        : { x: node.cx + NODE_W / 2, y: node.cy };
  }
}

function EdgePath({ edge, nodeById }: { edge: FlowEdge; nodeById: Map<string, PositionedNode> }) {
  const src = nodeById.get(edge.from);
  const tgt = nodeById.get(edge.to);
  if (!src || !tgt) return null;

  const isBack = tgt.cy <= src.cy;
  let start: { x: number; y: number };
  let end: { x: number; y: number };
  let d: string;

  if (isBack) {
    start = edgePort(src, "left");
    end = edgePort(tgt, "left");
    const bendX = Math.min(start.x, end.x) - 40;
    d = `M ${start.x} ${start.y} C ${bendX} ${start.y} ${bendX} ${end.y} ${end.x} ${end.y}`;
  } else {
    start = edgePort(src, "bottom");
    end = edgePort(tgt, "top");
    const midY = (start.y + end.y) / 2;
    d = `M ${start.x} ${start.y} C ${start.x} ${midY} ${end.x} ${midY} ${end.x} ${end.y}`;
  }

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth={1.5}
        markerEnd="url(#arrow)"
      />
      {edge.label && (
        <>
          <rect
            x={midX - 22}
            y={midY - 9}
            width={44}
            height={18}
            rx={4}
            fill="hsl(var(--background))"
          />
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="hsl(var(--muted-foreground))"
            fontFamily="inherit"
          >
            {edge.label}
          </text>
        </>
      )}
    </g>
  );
}

export function FlowchartViz({ data }: { data: FlowchartData }) {
  const positioned = useMemo(() => layoutNodes(data.nodes, data.edges), [data]);
  const nodeById = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned]);

  if (positioned.length === 0) return null;

  const xs = positioned.map((n) => n.cx);
  const ys = positioned.map((n) => n.cy);
  const minX = Math.min(...xs) - NODE_W / 2 - PAD;
  const maxX = Math.max(...xs) + NODE_W / 2 + PAD;
  const minY = Math.min(...ys) - DIAMOND_R - PAD;
  const maxY = Math.max(...ys) + DIAMOND_R + PAD;
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  return (
    <div className="space-y-3">
      <h3 className="font-serif font-semibold text-lg text-foreground">{data.title}</h3>
      <div className="border rounded-lg bg-muted/10 overflow-x-auto">
        <svg
          viewBox={viewBox}
          style={{ width: "100%", minHeight: 260, display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L8,3 z" fill="hsl(var(--border))" />
            </marker>
          </defs>

          {data.edges.map((e, i) => (
            <EdgePath key={i} edge={e} nodeById={nodeById} />
          ))}

          {positioned.map((n) => (
            <NodeShape key={n.id} node={n} />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {[
          { type: "start", label: "Start / Trigger" },
          { type: "action", label: "Action" },
          { type: "decision", label: "Decision" },
          { type: "end", label: "Outcome" },
        ].map(({ type, label }) => {
          const colors = nodeColor(type as FlowNode["type"]);
          return (
            <span key={type} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm inline-block border"
                style={{ background: colors.fill, borderColor: colors.stroke === "none" ? colors.fill : colors.stroke }}
              />
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
