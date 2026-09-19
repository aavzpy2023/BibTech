import { getNodeColor, calculateRadius } from './networkStyles';

/**
 * Renders a highly stylized 3D-like sphere for a node using Canvas radial gradients.
 */
export const drawNode = (node, ctx, globalScale) => {
    const radius = calculateRadius(node.papers);
    const color = getNodeColor(node.group);
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    
    // Create a 3D light-source effect (top-left offset)
    const gradient = ctx.createRadialGradient(
        node.x - radius / 3, 
        node.y - radius / 3, 
        radius / 10,
        node.x, 
        node.y, 
        radius
    );
    
    gradient.addColorStop(0, '#ffffff'); // Specular highlight
    gradient.addColorStop(0.3, color);   // Base color
    gradient.addColorStop(1, '#1f2937'); // Core shadow (Tailwind gray-800)
    
    ctx.fillStyle = gradient;
    ctx.fill();
};

/**
 * Renders smooth bezier curves for links, mapping weight to opacity and thickness.
 */
export const drawLink = (link, ctx, globalScale) => {
    const { source, target, weight } = link;
    
    const opacity = Math.min(0.8, 0.1 + (weight * 0.08));
    const thickness = Math.min(4, Math.max(0.5, weight * 0.4)) / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    
    // Quadratic-like Bezier control points to add a slight curve
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5 - dy * 0.15;
    const cy1 = source.y + dy * 0.5 + dx * 0.15;
    
    ctx.bezierCurveTo(cx1, cy1, cx1, cy1, target.x, target.y);
    
    ctx.strokeStyle = `rgba(156, 163, 175, ${opacity})`; // Tailwind gray-400
    ctx.lineWidth = thickness;
    ctx.stroke();
};