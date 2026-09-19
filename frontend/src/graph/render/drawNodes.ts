import type { NetworkNode } from "../types";

const TOP_PALETTE = [
    { start: "#ff6b6b", end: "#e63946" },
    { start: "#60a5fa", end: "#1d4ed8" },
    { start: "#4fd1c5", end: "#2a9d8f" },
    { start: "#fde047", end: "#e9c46a" },
];

let topClustersCache: string[] | null = null;
let lastNodesRef: NetworkNode[] | null = null;

const getTopClusters = (nodes: NetworkNode[]): string[] => {
    if (nodes === lastNodesRef && topClustersCache) {
        return topClustersCache;
    }
    const counts = new Map<string, number>();
    nodes.forEach(n => {
        const cid = String(n.cluster ?? (n as any).group);
        counts.set(cid, (counts.get(cid) || 0) + 1);
    });
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    topClustersCache = sorted.slice(0, 4).map(e => e[0]);
    lastNodesRef = nodes;
    return topClustersCache;
};

/**
 * Pure function to render spherical 3D nodes.
 * Iterates context drawing for individual radial gradients.
 */
export const drawNodes = (
    ctx: CanvasRenderingContext2D,
    nodes: NetworkNode[]
) => {
    const topClusters = getTopClusters(nodes);
    const threshold = 15;

    nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

        // Offset gradient origin to simulate top-left directional lighting
        const offset = node.radius / 3;
        const grad = ctx.createRadialGradient(
            node.x - offset, node.y - offset, 0,
            node.x, node.y, node.radius
        );

        const clusterId = String(node.cluster ?? (node as any).group);
        const idx = topClusters.indexOf(clusterId);
        const colors = idx !== -1 ? TOP_PALETTE[idx] : { start: "#e5e7eb", end: "#c9c9c9" };

        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, colors.start);
        grad.addColorStop(1, colors.end);

        const isLarge = (node.degree ?? node.radius) > threshold;

        if (isLarge) {
            ctx.shadowColor = "rgba(0,0,0,0.25)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetY = 3;
        } else {
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }

        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.shadowColor = "transparent"; // Reset shadow
        ctx.lineWidth = isLarge ? 3 : 0.5;
        ctx.strokeStyle = isLarge ? "#ffffff" : "#111827";
        ctx.stroke();
    });
};