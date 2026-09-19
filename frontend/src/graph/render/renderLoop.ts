import type { NetworkNode, NetworkLink } from "../types";
import { drawLinks } from "./drawLinks";
import { drawNodes } from "./drawNodes";
import { drawLabels } from "./drawLabels";

/**
 * Orchestrates a single tick/frame of the Canvas rendering.
 * Enforces strict Z-index rendering order: Canvas Clear -> Links -> Nodes -> Labels.
 */
export const executeRenderFrame = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    nodes: NetworkNode[],
    links: NetworkLink[]
) => {
    // Hard physics bounding box constraint: Prevents any node from escaping the canvas
    const margin = 40; 
    nodes.forEach((n) => {
        if (n.x != null) n.x = Math.max(margin, Math.min(width - margin, n.x));
        if (n.y != null) n.y = Math.max(margin, Math.min(height - margin, n.y));
    });

    ctx.clearRect(0, 0, width, height);
    
    drawLinks(ctx, links);
    drawNodes(ctx, nodes);
    drawLabels(ctx, nodes);
};