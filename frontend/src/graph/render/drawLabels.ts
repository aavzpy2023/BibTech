import type { NetworkNode } from "../types";

/**
 * Pure function to render typography/labels attached to nodes.
 * Executes fillText offset by the node's radius to prevent overlaps.
 */
export const drawLabels = (
    ctx: CanvasRenderingContext2D,
    nodes: NetworkNode[]
) => {
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;
        
        const offsetX = node.x + node.radius + 6;
        const offsetY = node.y;
        
        // Halo effect for readability over links/nodes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 3;
        ctx.strokeText(node.name, offsetX, offsetY);
        
        ctx.fillStyle = "#1e293b"; // Slate-800
        ctx.fillText(node.name, offsetX, offsetY);
    });
};