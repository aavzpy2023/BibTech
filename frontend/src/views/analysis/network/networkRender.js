import { getNodeColor, calculateRadius } from './networkStyles';

let labelCache = new Map();
let cacheNodes = null;
let lastK = -1;
let graphNodes = [];
let activeHoveredNodeId = null;
let edgeOpacityMultiplier = 0.35;

export const setEdgeOpacityMultiplier = (val) => {
    edgeOpacityMultiplier = val;
};

export const setHoveredNodeId = (id) => {
    activeHoveredNodeId = id;
};

export const setRenderNodes = (nodes) => {
    graphNodes = nodes || [];
    cacheNodes = null;
    lastK = -1;
};

// Hubs = los pocos nodos más conectados. Con umbral absoluto (degree >= 5) casi
// todos los autores de un artículo con muchos coautores serían "hubs" y sus
// etiquetas forzadas se apilarían unas sobre otras.
const HUB_MAX = 12;
const HUB_RATIO = 0.15;
const HUB_MIN_DEGREE = 5;

export const pickHubIds = (nodes) => {
    const limit = Math.min(HUB_MAX, Math.ceil(nodes.length * HUB_RATIO));
    const ranked = nodes
        .filter(n => (n.degree || 0) >= HUB_MIN_DEGREE)
        .sort((a, b) => (b.degree || 0) - (a.degree || 0));
    return new Set(ranked.slice(0, limit).map(n => n.id));
};

/**
 * Colocación greedy anti-solape. Devuelve Map(id -> { x, y, w, h, fs, hub }) en
 * coordenadas del grafo. Los nodos que no encuentran hueco se quedan sin etiqueta;
 * solo los hubs se fuerzan.
 */
export const layoutLabels = (nodes, ctx, k) => {
    const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const placed = nodes.map(n => {
        const r = calculateRadius(n);
        return { x: n.x - r, y: n.y - r, w: 2 * r, h: 2 * r };
    });
    const out = new Map();
    const hubIds = pickHubIds(nodes);
    const margin = 1.5 / k;

    [...nodes].sort((a, b) => (b.degree || 0) - (a.degree || 0)).forEach(n => {
        const r = calculateRadius(n);
        const g = 3 / k;
        const d = r * 0.7;
        const isHub = hubIds.has(n.id);
        let last = null;

        for (const f of [1, 0.85, 0.7]) {          // fuente normal, -15 %, -30 %
            const fs = ((11 + r * 0.25) / k) * f;
            ctx.font = `${isHub ? 600 : 500} ${fs}px Sans-Serif`;   // mismo peso que en paintLabel
            const w = ctx.measureText(n.name || '').width;
            const h = fs * 1.2;
            const cands = [
                { x: n.x + r + g,         y: n.y - h / 2 },          // derecha
                { x: n.x - r - g - w,     y: n.y - h / 2 },          // izquierda
                { x: n.x - w / 2,         y: n.y + r + g },          // abajo
                { x: n.x - w / 2,         y: n.y - r - g - h },      // arriba
                { x: n.x + d + g,         y: n.y - d - g - h },      // arriba-derecha
                { x: n.x + d + g,         y: n.y + d + g },          // abajo-derecha
                { x: n.x - d - g - w,     y: n.y - d - g - h },      // arriba-izquierda
                { x: n.x - d - g - w,     y: n.y + d + g },          // abajo-izquierda
                { x: n.x + r + g * 3,     y: n.y - h / 2 }           // derecha, más lejos
            ];
            const pick = cands.find(c => {
                const box = { x: c.x - margin, y: c.y - margin, w: w + 2 * margin, h: h + 2 * margin };
                return !placed.some(p => hit(box, p));
            });
            last = { fs, w, h, first: cands[0] };
            if (pick) {
                placed.push({ ...pick, w, h });
                out.set(n.id, { ...pick, w, h, fs, hub: isHub });
                return;
            }
        }
        // los hubs (pocos) siempre llevan etiqueta, aunque se solape un poco
        if (isHub && last) {
            placed.push({ ...last.first, w: last.w, h: last.h });
            out.set(n.id, { ...last.first, w: last.w, h: last.h, fs: last.fs, hub: true });
        }
    });
    return out;
};

const ensureLabels = (nodes, ctx, k) => {
    if (cacheNodes === nodes && lastK === k) return;
    try {
        labelCache = layoutLabels(nodes, ctx, k);
    } catch (e) {
        console.error('layoutLabels error:', e);
        labelCache = new Map();
    }
    cacheNodes = nodes;
    lastK = k;
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

    const isLarge = (node.degree || 0) > 15 || radius > 8;
    if (isLarge) {
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
    }

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.shadowColor = 'transparent'; // reset for strokes
    ctx.lineWidth = isLarge ? 2 / (globalScale || 1) : 0.5 / (globalScale || 1);
    ctx.strokeStyle = isLarge ? '#ffffff' : '#1e293b';
    ctx.stroke();
};

/**
 * Pinta una etiqueta ya colocada por layoutLabels.
 */
export const paintLabel = (node, pos, ctx) => {
    ctx.font = `${pos.hub ? '600' : '500'} ${pos.fs}px Sans-Serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const text = node.name || '';

    if (ctx.strokeText) {                       // halo blanco: legible sobre las aristas
        ctx.lineJoin = 'round';
        ctx.lineWidth = pos.fs * 0.28;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeText(text, pos.x, pos.y);
    }
    ctx.fillStyle = pos.hub ? '#0f172a' : '#334155';
    ctx.fillText(text, pos.x, pos.y);
};

/**
 * Etiqueta de un solo nodo (usa la caché registrada con setRenderNodes).
 */
export const drawLabel = (node, ctx, globalScale) => {
    if (graphNodes.length > 0) ensureLabels(graphNodes, ctx, globalScale);
    const pos = labelCache.get(node.id);
    if (!pos) return;
    paintLabel(node, pos, ctx);
};

/**
 * Todas las etiquetas en una sola pasada, DESPUÉS de dibujar nodos y aristas,
 * para que ningún nodo tape un texto. Pensada para onRenderFramePost.
 */
export const drawAllLabels = (nodes, ctx, globalScale) => {
    if (!nodes || nodes.length === 0) return;
    ensureLabels(nodes, ctx, globalScale);
    nodes.forEach(n => {
        const pos = labelCache.get(n.id);
        if (pos) paintLabel(n, pos, ctx);
    });
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

/**
 * Renders smooth bezier curves for links, mapping weight to opacity and thickness.
 */
export const drawLink = (link, ctx, globalScale) => {
    const { source, target, weight = 1 } = link;
    if (!source || !target || source.x == null || target.x == null) return;

    // Focus mode: Check if edge connects to currently hovered/selected author
    const isHoverActive = activeHoveredNodeId != null;
    const isConnected = isHoverActive && (source.id === activeHoveredNodeId || target.id === activeHoveredNodeId);

    // 🚀 RENDERING CULLING (Optimizador de Performance):
    // Abortamos la función instantáneamente si la arista no participa en el hover.
    // Esto ahorra miles de cálculos de curvas Bezier (CPU) y rasterizados (GPU) por frame.
    if (isHoverActive && !isConnected) return;

    const isHighlighted = Boolean(link.highlighted || link.hovered || isConnected);

    // 2 + 4: Weight-driven opacity with extreme contrast separation in focus mode
        const sourceGroup = String(source.group || source.cluster);
        const targetGroup = String(target.group || target.cluster);
        const isIntra = sourceGroup === targetGroup;

    const color = isHighlighted
        ? getNodeColor(source.group)
        : (isIntra ? '#64748b' : '#94a3b8');

    let opacity;
    if (isHighlighted) {
        // 🚀 INMUNIDAD AL SLIDER: Las aristas enfocadas brillan siempre con su
        // opacidad natural (65% al 95%). Permite el modo "Solo mostrar en hover"
        // si el usuario baja el slider global a 0.
        opacity = Math.min(0.95, 0.65 + weight * 0.10);
    } else if (isHoverActive) {
        opacity = 0.00002; // IGNORAR SLIDER: forzar fondo tenue invariable
    } else {
        if (isIntra) {
            // Intra-cluster: clearly visible at max slider (0.35 - 0.85)
            opacity = Math.min(0.85, (0.35 + weight * 0.10) * edgeOpacityMultiplier);
        } else {
            // Inter-cluster: visible structure without visual noise (0.18 - 0.50)
            opacity = Math.min(0.50, (0.18 + weight * 0.05) * edgeOpacityMultiplier);
        }
    }

    // 🚀 RENDERING CULLING GLOBAL (Si Slider = 0): No dibujamos lo invisible.
    if (opacity <= 0.01) return;

    const thickness = (isHighlighted
        ? Math.min(3.0, 1.2 + weight * 0.40)
        : (isIntra
            ? Math.min(2.0, 0.9 + weight * 0.25)
            : Math.min(1.3, 0.6 + weight * 0.15))) / globalScale;

    ctx.save();
    // 6. Multiply composite prevents washed-out overlaps on white background
    ctx.globalCompositeOperation = 'multiply';
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5 - dy * 0.04;
    const cy1 = source.y + dy * 0.5 + dx * 0.04;

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
    ctx.restore();
};
