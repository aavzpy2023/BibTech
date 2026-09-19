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
    ctx.clearRect(0, 0, width, height);
    
    const sortedNodes = [...nodes].sort((a, b) => {
        const valA = a.degree ?? a.radius;
        const valB = b.degree ?? b.radius;
        return valA - valB;
    });
    
    drawLinks(ctx, links);
    drawNodes(ctx, sortedNodes);
    drawLabels(ctx, sortedNodes);
};