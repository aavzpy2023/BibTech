import type { NetworkNode } from "../types";

/**
 * Pure function to render typography/labels attached to nodes.
 * Executes fillText offset by the node's radius to prevent overlaps.
 */
export const drawLabels = (
    ctx: CanvasRenderingContext2D,
    nodes: NetworkNode[]
) => {
    ctx.fillStyle = "#0f172a"; // Dark navy slate
    ctx.font = "10px sans-serif";
    
    nodes.forEach((node) => {
        if (node.x == null || node.y == null) return;
        
        // Offset label from the center, pushed slightly past the node radius
        const offsetX = node.x + node.radius + 4;
        const offsetY = node.y + 3; // Vertical center alignment adjustment
        
        ctx.fillText(node.name, offsetX, offsetY);
    });
};