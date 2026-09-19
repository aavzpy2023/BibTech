import { layoutLabels } from './networkRender';
import { calculateRadius } from './networkStyles';

let measureCtx;
const getMeasureCtx = () => {
    if (measureCtx !== undefined) return measureCtx;
    try {
        measureCtx = document.createElement('canvas').getContext('2d') || null;
    } catch (e) {
        measureCtx = null;
    }
    return measureCtx;
};

/**
 * Caja que contiene nodos (con su radio) y, si hay ctx, sus etiquetas colocadas
 * para el zoom k. `labelScale` permite exportar a un lienzo mayor que la pantalla:
 * las etiquetas se dimensionan como si el zoom fuera k / labelScale.
 */
export const boundsWithLabels = (nodes, ctx, k, labelScale = 1) => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    nodes.forEach(n => {
        const r = calculateRadius(n);
        x0 = Math.min(x0, n.x - r); x1 = Math.max(x1, n.x + r);
        y0 = Math.min(y0, n.y - r); y1 = Math.max(y1, n.y + r);
    });
    if (ctx) {
        layoutLabels(nodes, ctx, k / labelScale).forEach(p => {
            x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x + p.w);
            y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y + p.h);
        });
    }
    return { x0, x1, y0, y1 };
};

/**
 * Zoom k y traslación (x, y) para que el grafo, etiquetas incluidas, llene W×H
 * con un margen `pad` en píxeles. El tamaño de las etiquetas en unidades del grafo
 * depende de k, así que se itera hasta converger (2-4 pasadas).
 */
export const fitTransform = (nodes, W, H, ctx, { pad = 24, labelScale = 1 } = {}) => {
    if (!nodes || nodes.length === 0 || !W || !H) {
        return { k: 1, x: (W || 0) / 2, y: (H || 0) / 2, bounds: null };
    }
    let k = 1;
    let b = boundsWithLabels(nodes, ctx, k, labelScale);
    for (let i = 0; i < 8; i++) {
        const next = Math.min(
            (W - 2 * pad) / Math.max(1, b.x1 - b.x0),
            (H - 2 * pad) / Math.max(1, b.y1 - b.y0)
        );
        if (!Number.isFinite(next) || next <= 0) break;
        const converged = Math.abs(next - k) / k < 0.005;
        k = next;
        b = boundsWithLabels(nodes, ctx, k, labelScale);
        if (converged) break;
    }
    return {
        k,
        x: W / 2 - (k * (b.x0 + b.x1)) / 2,
        y: H / 2 - (k * (b.y0 + b.y1)) / 2,
        bounds: b
    };
};

/**
 * Aplica el ajuste a una instancia de react-force-graph-2d.
 */
export const fitGraphView = (fg, nodes, W, H, pad = 24) => {
    if (!fg || !nodes || nodes.length === 0 || !W || !H) return;
    const { k, bounds } = fitTransform(nodes, W, H, getMeasureCtx(), { pad });
    if (!bounds) return;
    fg.zoom(k, 0);
    fg.centerAt((bounds.x0 + bounds.x1) / 2, (bounds.y0 + bounds.y1) / 2, 0);
};
