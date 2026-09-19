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

    ctx.lineWidth = 0.5 / globalScale;
    ctx.strokeStyle = '#111827';
    ctx.stroke();
};

/**
 * Renders smooth bezier curves for links, mapping weight to opacity and thickness.
 */
export const drawLabel = (node, ctx, globalScale) => {
    const LABEL_SCALE_THRESHOLD = 1.2;
    if (globalScale < LABEL_SCALE_THRESHOLD && (node.degree || 0) < 3) return;

    const radius = calculateRadius(node.papers);
    const fontSize = Math.max(4, 12 / globalScale);
    
    ctx.font = `500 ${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1e293b'; // neutral dark-gray
    
    ctx.fillText(node.name, node.x, node.y + radius + (2 / globalScale));
};

export const drawBranding = (ctx, width, height) => {
    ctx.save();
    ctx.font = 'bold 16px Sans-Serif';
    ctx.fillStyle = 'rgba(156, 163, 175, 0.4)'; // Tailwind gray-400, 40% opacity
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('NOVASCOPE', width - 20, height - 20);
    ctx.restore();
};

export const drawLink = (link, ctx, globalScale) => {
    const { source, target, weight } = link;
    
    const opacity = Math.min(0.35, 0.12 + (weight * 0.05));
    const thickness = Math.min(1.5, Math.max(0.5, weight * 0.3)) / globalScale;
    
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    
    // Quadratic-like Bezier control points to add a slight curve
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5 - dy * 0.1;
    const cy1 = source.y + dy * 0.5 + dx * 0.1;
    
    ctx.bezierCurveTo(cx1, cy1, cx1, cy1, target.x, target.y);
    
    ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`; // neutral light blue/gray
    ctx.lineWidth = thickness;
    ctx.stroke();
};