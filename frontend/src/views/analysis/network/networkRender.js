import { getNodeColor, calculateRadius } from './networkStyles';

let labelCache = new Map();
let lastK = -1;
let graphNodes = [];

export const setRenderNodes = (nodes) => {
    graphNodes = nodes || [];
    lastK = -1;
};

export const layoutLabels = (nodes, ctx, k) => {
    const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const placed = nodes.map(n => {
        const r = calculateRadius(n);
        return { x: n.x - r, y: n.y - r, w: 2 * r, h: 2 * r };
    });
    const out = new Map();
    [...nodes].sort((a, b) => (b.degree || 0) - (a.degree || 0)).forEach(n => {
        const r = calculateRadius(n), fs = (11 + r * 0.25) / k, g = 3 / k;
        ctx.font = `500 ${fs}px Sans-Serif`;
        const w = ctx.measureText(n.name || '').width, h = fs * 1.2;
        const cands = [
            { x: n.x + r + g,     y: n.y - h / 2 },
            { x: n.x - r - g - w, y: n.y - h / 2 },
            { x: n.x - w / 2,     y: n.y + r + g },
            { x: n.x - w / 2,     y: n.y - r - g - h },
            { x: n.x + r + g * 3, y: n.y - h / 2 }
        ];
        let pick = cands.find(c => !placed.some(p => hit({ ...c, w, h }, p)));
        
        if (!pick && (n.degree || 0) >= 5) {
            pick = cands[0];
            fs = fs * 0.85;
        }

        if (pick) { placed.push({ ...pick, w, h }); out.set(n.id, { ...pick, fs }); }
    });
    return out;
};

/**
 * Renders a highly stylized 3D-like sphere for a node using Canvas radial gradients.
 */
export const drawNode = (node, ctx, globalScale) => {
    const radius = calculateRadius(node);
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
    
    const darken = (hex) => {
        if (!hex || !hex.startsWith('#')) return '#1e293b';
        const r = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.5);
        const g = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.5);
        const b = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.5);
        return `rgb(${r},${g},${b})`;
    };

    gradient.addColorStop(0, '#ffffff'); // Specular highlight
    gradient.addColorStop(0.3, color);   // Base color
    gradient.addColorStop(1, darken(color)); // Core shadow
    
    ctx.fillStyle = gradient;
    ctx.fill();
};

/**
 * Renders smooth bezier curves for links, mapping weight to opacity and thickness.
 */
export const drawLabel = (node, ctx, globalScale) => {
    if (lastK !== globalScale && graphNodes.length > 0) {
        labelCache = layoutLabels(graphNodes, ctx, globalScale);
        lastK = globalScale;
    }
    
    const pos = labelCache.get(node.id);
    if (!pos) return;

    const isHub = (node.degree || 0) >= 5;
    ctx.font = `${isHub ? '600' : '500'} ${pos.fs}px Sans-Serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isHub ? '#0f172a' : '#334155';
    
    ctx.fillText(node.name || '', pos.x, pos.y);
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
    
    const opacity = Math.min(0.6, 0.15 + (weight * 0.08));
    const thickness = Math.min(2.0, Math.max(0.5, weight * 0.4)) / globalScale;
    const color = getNodeColor(source.group);
    
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    
    // Quadratic-like Bezier control points to add a slight curve
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5 - dy * 0.1;
    const cy1 = source.y + dy * 0.5 + dx * 0.1;
    
    ctx.bezierCurveTo(cx1, cy1, cx1, cy1, target.x, target.y);
    
    const hexToRgba = (hex, alpha) => {
        if (!hex || !hex.startsWith('#')) return `rgba(148, 163, 184, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    ctx.strokeStyle = hexToRgba(color, opacity);
    ctx.lineWidth = thickness;
    ctx.stroke();
};