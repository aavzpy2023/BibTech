import type { NetworkLink, NetworkNode } from "../types";

/**
 * Pure function to render structural connections between nodes.
 * Executes a single batch path to preserve canvas frame performance.
 */
export const drawLinks = (
    ctx: CanvasRenderingContext2D,
    links: NetworkLink[]
) => {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    
    links.forEach((link) => {
        const source = link.source as NetworkNode;
        const target = link.target as NetworkNode;

        if (source.x != null && source.y != null && target.x != null && target.y != null) {
            ctx.beginPath();

            const sourceCluster = String(source.cluster ?? (source as any).group);
            const targetCluster = String(target.cluster ?? (target as any).group);
            const isIntra = sourceCluster === targetCluster;
            
            const weight = link.weight ?? 1;
            let opacity = 0.12;
            
            if (isIntra) {
                opacity = Math.min(0.4, 0.15 + weight * 0.05);
                ctx.lineWidth = 0.8;
            } else {
                opacity = Math.min(0.08, 0.03 + weight * 0.01);
                ctx.lineWidth = 0.4;
            }
            
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity.toFixed(3)})`;

            ctx.moveTo(source.x, source.y);
            
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            
            const cpX = midX - dy * 0.2;
            const cpY = midY + dx * 0.2;
            
            ctx.quadraticCurveTo(cpX, cpY, target.x, target.y);
            ctx.stroke();
        }
    });
    
    ctx.restore();
};