import { drawNode, drawLink, layoutLabels, paintLabel } from './networkRender';
import { fitTransform } from './networkFit';
import { getNodeColor } from './networkStyles';

const EXPORT_W = 3200;
const EXPORT_H = 2000;          // 16:10, como la maqueta y el contenedor de pantalla
const REFERENCE_W = 1600;       // ancho para el que están pensados los tamaños base (fuentes, trazos)

const loadImage = (src) => new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
});

/**
 * Logo + separador + "NOVA" (azul marino) + "SCOPE" (degradado violeta), abajo a la derecha.
 * Se dibuja en píxeles de lienzo, sin transformación de zoom.
 */
export const drawExportBranding = (ctx, W, H, logo = null) => {
    const s = W / REFERENCE_W;
    const pad = 40 * s;
    const icon = 52 * s;
    const cy = H - pad - icon / 2;

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${28 * s}px Sans-Serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${3 * s}px`;

    const novaW = ctx.measureText('NOVA').width;
    const scopeW = ctx.measureText('SCOPE').width;
    const x = W - pad - novaW - scopeW;

    ctx.fillStyle = '#1e2a5c';
    ctx.fillText('NOVA', x, cy);
    const grad = ctx.createLinearGradient(x + novaW, 0, x + novaW + scopeW, 0);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.fillText('SCOPE', x + novaW, cy);

    const sepX = x - 16 * s;
    ctx.strokeStyle = 'rgba(30, 42, 92, 0.45)';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(sepX, cy - icon / 2 + 4 * s);
    ctx.lineTo(sepX, cy + icon / 2 - 4 * s);
    ctx.stroke();

    if (logo) ctx.drawImage(logo, sepX - 16 * s - icon, cy - icon / 2, icon, icon);
    ctx.restore();
};

export const drawExportLegend = (ctx, W, H, clusters, nodes) => {
    if (!nodes || nodes.length === 0) return;
    const counts = {};
    nodes.forEach(n => {
        if (n.group != null) counts[n.group] = (counts[n.group] || 0) + 1;
    });
    const groupKeys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    if (groupKeys.length === 0) return;

    const top4 = groupKeys.slice(0, 4);
    const items = top4.map(gid => ({
        name: clusters?.[gid]?.name || `Cluster ${gid}`,
        color: clusters?.[gid]?.color || getNodeColor(gid)
    }));

    if (groupKeys.length > 4) {
        items.push({ name: 'Others', color: '#c9c9c9' });
    }

    const s = W / REFERENCE_W;
    const padX = 24 * s;
    const padY = 24 * s;
    const itemH = 22 * s;
    const radius = 5.5 * s;

    ctx.save();
    ctx.font = `500 ${11 * s}px Sans-Serif`;

    let maxW = 0;
    items.forEach(item => {
        const w = ctx.measureText(item.name || '').width;
        if (w > maxW) maxW = w;
    });

    const headerH = 18 * s;
    const boxW = Math.max(140 * s, maxW + 38 * s);
    const boxH = items.length * itemH + headerH + 16 * s;
    const x = padX;
    const y = H - padY - boxH;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 15 * s;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, boxW, boxH, 6 * s);
    else ctx.rect(x, y, boxW, boxH);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Encabezado idéntico a la app (escala compacta)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `700 ${9.5 * s}px Sans-Serif`;
    ctx.fillStyle = '#64748b';
    ctx.fillText('CLUSTERS', x + 14 * s, y + 10 * s);

    ctx.font = `500 ${11 * s}px Sans-Serif`;
    ctx.textBaseline = 'middle';
    items.forEach((item, i) => {
        const cy = y + headerH + 10 * s + itemH / 2 + i * itemH;
        ctx.beginPath();
        ctx.arc(x + 16 * s, cy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = item.color || '#9ca3af';
        ctx.fill();
        
        ctx.fillStyle = '#334155';
        ctx.fillText(item.name || '', x + 28 * s, cy);
    });
    ctx.restore();
};

/**
 * Dibuja la red completa en `canvas` (fondo blanco, ajustada al lienzo, etiquetas al final).
 * No toca el canvas de pantalla ni la caché de etiquetas de pantalla.
 */
export const renderNetworkToCanvas = (canvas, { nodes, links = [], clusters = null, logo = null }) => {
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    const labelScale = W / REFERENCE_W;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const { k, x, y } = fitTransform(nodes, W, H, ctx, { pad: 50 * labelScale, labelScale });
    // Todo lo que en pantalla se define en px de pantalla (trazos, fuentes) se
    // escala igual: se dibuja como si el zoom de pantalla fuese k / labelScale.
    const kEff = k / labelScale;

    const byId = new Map(nodes.map(n => [n.id, n]));
    const resolve = (e) => (e && typeof e === 'object' ? e : byId.get(e));

    ctx.setTransform(k, 0, 0, k, x, y);
    links.forEach(l => {
        const source = resolve(l.source);
        const target = resolve(l.target);
        if (source && target) drawLink({ ...l, source, target }, ctx, kEff);
    });
    nodes.forEach(n => drawNode(n, ctx, kEff));

    const labels = layoutLabels(nodes, ctx, kEff);
    nodes.forEach(n => {
        const pos = labels.get(n.id);
        if (pos) paintLabel(n, pos, ctx);
    });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawExportLegend(ctx, W, H, clusters, nodes);
    drawExportBranding(ctx, W, H, logo);
    return canvas;
};

const saveCanvas = (canvas, filename) => new Promise((resolve) => {
    const save = (href, revoke) => {
        const a = document.createElement('a');
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        if (revoke) setTimeout(() => URL.revokeObjectURL(href), 1000);
        resolve();
    };
    if (canvas.toBlob) {
        canvas.toBlob(
            blob => (blob ? save(URL.createObjectURL(blob), true) : save(canvas.toDataURL('image/png'), false)),
            'image/png'
        );
    } else {
        save(canvas.toDataURL('image/png'), false);
    }
});

const exportOffscreen = async (filename, { nodes, links, clusters = null, logoSrc = null, width = EXPORT_W, height = EXPORT_H }) => {
    try {
        const logo = await loadImage(logoSrc);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        if (!canvas.getContext('2d')) return;
        renderNetworkToCanvas(canvas, { nodes, links, clusters, logo });
        await saveCanvas(canvas, filename);
    } catch (err) {
        console.error('HD Export Error:', err);
    }
};

/**
 * Con `options.nodes` re-renderiza la red en un canvas offscreen de alta resolución.
 * Sin ellas conserva el comportamiento anterior (copia ampliada del canvas de pantalla).
 */
export const exportCanvasToImage = (canvasRef, filename = 'network-export.png', options = null) => {
    if (options && options.nodes && options.nodes.length > 0) {
        return exportOffscreen(filename, options);
    }

    try {
        const fgEl = canvasRef.current;
        // react-force-graph exposes its internal canvas via the canvas property on the ref
        const fgCanvas = fgEl ? fgEl.canvas || document.querySelector('canvas') : null;
        if (!fgCanvas) return;

        const scale = 2.5;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = fgCanvas.width * scale;
        exportCanvas.height = fgCanvas.height * scale;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return;

        // Apply white background safely
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw original canvas
        ctx.drawImage(fgCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

        // Execute download
        const a = document.createElement('a');
        a.href = exportCanvas.toDataURL('image/png');
        a.download = filename;
        a.click();
    } catch (err) {
        console.error('HD Export Error:', err);
    }
};
