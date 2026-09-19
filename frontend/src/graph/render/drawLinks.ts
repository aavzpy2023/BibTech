import type { NetworkLink, NetworkNode } from "../types";

/**
 * Pure function to render structural connections between nodes.
 * Executes a single batch path to preserve canvas frame performance.
 */
export const drawLinks = (
    ctx: CanvasRenderingContext2D,
    links: NetworkLink[]
) => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    
    links.forEach((link) => {
        // D3 force simulation coerces source/target into object references
        const source = link.source as NetworkNode;
        const target = link.target as NetworkNode;

        if (source.x != null && source.y != null && target.x != null && target.y != null) {
            ctx.moveTo(source.x, source.y);
            
            // Calculate midpoint and offset for a subtle bezier curve
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            
            const cpX = midX - dy * 0.2;
            const cpY = midY + dx * 0.2;
            
            ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
        }
    });
    
    ctx.stroke();
};