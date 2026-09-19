import type { NetworkNode } from "../types";

const CLUSTER_PALETTE = {
    red: { start: "#ff6b6b", end: "#c92a2a" },
    blue: { start: "#4dabf7", end: "#1864ab" },
    green: { start: "#69db7c", end: "#2b8a3e" },
};

/**
 * Pure function to render spherical 3D nodes.
 * Iterates context drawing for individual radial gradients.
 */
export const drawNodes = (
    ctx: CanvasRenderingContext2D,
    nodes: NetworkNode[]
) => {
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

        const colors = CLUSTER_PALETTE[node.cluster as keyof typeof CLUSTER_PALETTE] || { start: "#9ca3af", end: "#4b5563" };
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, colors.start);
        grad.addColorStop(1, "#1f2937");

        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#111827';
        ctx.stroke();
    });
};