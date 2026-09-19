import type { NetworkNode } from "../types";

const GRADIENT_PALETTE = [
    { start: "#ff6b6b", end: "#c92a2a" }, // 1: Red
    { start: "#4dabf7", end: "#1864ab" }, // 2: Blue
    { start: "#69db7c", end: "#2b8a3e" }, // 3: Green
    { start: "#4dd0e1", end: "#0097a7" }, // 4: Cyan
    { start: "#ffb74d", end: "#f57c00" }, // 5: Orange
    { start: "#ba68c8", end: "#7b1fa2" }, // 6: Purple
    { start: "#fff176", end: "#fbc02d" }, // 7: Yellow
    { start: "#f06292", end: "#c2185b" }, // 8: Pink
    { start: "#a1887f", end: "#5d4037" }, // 9: Brown
    { start: "#dce775", end: "#afb42b" }, // 10: Lime
    { start: "#9575cd", end: "#512da8" }, // 11: Deep Purple
    { start: "#4db6ac", end: "#00796b" }, // 12: Teal
    { start: "#ff8a65", end: "#e64a19" }, // 13: Deep Orange
    { start: "#90a4ae", end: "#455a64" }, // 14: Blue Grey
    { start: "#aed581", end: "#689f38" }, // 15: Light Green
];

const getGradientColors = (clusterId: string | number | undefined) => {
    if (clusterId === 'red') return GRADIENT_PALETTE[0];
    if (clusterId === 'blue') return GRADIENT_PALETTE[1];
    if (clusterId === 'green') return GRADIENT_PALETTE[2];

    const idx = parseInt(String(clusterId), 10);
    if (!isNaN(idx)) {
        const safeIdx = Math.max(0, idx - 1);
        return GRADIENT_PALETTE[safeIdx % GRADIENT_PALETTE.length];
    }
    return { start: "#9ca3af", end: "#4b5563" }; // Fallback
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

        const clusterId = node.cluster ?? (node as any).group;
        const colors = getGradientColors(clusterId);
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