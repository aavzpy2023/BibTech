import React, { useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import useCoAuthorshipNetwork from '../../hooks/useCoAuthorshipNetwork';
import AnalysisPageTemplate from './AnalysisPageTemplate';
import logoImg from '../../assets/logo.png';

// Novascope vibrant cluster palette
const CLUSTER_COLORS = {
    1: { base: '#ef4444', light: '#fca5a5', dark: '#991b1b' },
    2: { base: '#3b82f6', light: '#93c5fd', dark: '#1e40af' },
    3: { base: '#10b981', light: '#6ee7b7', dark: '#065f46' },
    4: { base: '#06b6d4', light: '#67e8f9', dark: '#155e75' }
};

function getOverlayColor(year) {
    if (year <= 2016) return '#3b82f6';
    if (year <= 2018) return '#06b6d4';
    if (year <= 2019.5) return '#10b981';
    return '#facc15';
}

const styles = {
    controlGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    label: {
        fontSize: '12px',
        color: '#c9d1d9',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    input: {
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '5px 10px',
        color: '#f0f6fc',
        fontSize: '12px',
        outline: 'none'
    },
    modeSwitchGroup: {
        display: 'inline-flex',
        borderRadius: '6px',
        border: '1px solid #30363d',
        overflow: 'hidden'
    },
    modeBtn: (isActive) => ({
        backgroundColor: isActive ? '#1f6feb' : '#0d1117',
        color: isActive ? '#ffffff' : '#8b949e',
        border: 'none',
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }),
    exportBtn: {
        backgroundColor: '#238636',
        color: '#ffffff',
        border: '1px solid #2ea043',
        borderRadius: '6px',
        padding: '5px 12px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    fitBtn: {
        backgroundColor: '#21262d',
        color: '#f0f6fc',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '5px 10px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    canvasWrapper: {
        position: 'relative',
        width: '100%',
        height: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        overflow: 'hidden'
    },
    watermark: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '6px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    },
    logoImage: {
        width: '32px',
        height: '32px',
        objectFit: 'contain'
    },
    legendPanel: {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'none'
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '11px',
        color: '#1e293b',
        fontWeight: '500'
    },
    legendDot: (color) => ({
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: color
    })
};

export default function CoAuthorshipNetwork() {
    const fgRef = useRef();

    const {
        nodes,
        links,
        minWeight,
        setMinWeight,
        searchQuery,
        setSearchQuery,
        selectedNodeId,
        setSelectedNodeId,
        hoveredNodeId,
        setHoveredNodeId,
        selectedNode,
        viewMode,
        setViewMode,
        clusters,
        nodeScale,
        setNodeScale
    } = useCoAuthorshipNetwork();

    // Prepare immutable graphData payload for react-force-graph
    const graphData = useMemo(() => {
        return {
            nodes: nodes.map(n => ({ ...n })),
            links: links.map(l => ({ ...l }))
        };
    }, [nodes, links]);

    // Custom 3D bubble painting on 2D HTML5 canvas
    const paintNode = useCallback((node, ctx, globalScale) => {
        const baseR = 7 + Math.sqrt(node.papers || 1) * 3;
        const r = Math.max(3, baseR * nodeScale);
        const isMatch =
            !searchQuery.trim() ||
            node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isHovered = hoveredNodeId === node.id;
        const isSelected = selectedNodeId === node.id;

        const pal = CLUSTER_COLORS[node.group] || CLUSTER_COLORS[1];
        const fillColor =
            viewMode === 'overlay' ? getOverlayColor(node.avgYear) : pal.base;
        const lightColor =
            viewMode === 'overlay' ? '#ffffff' : pal.light;
        const darkColor =
            viewMode === 'overlay' ? '#1e293b' : pal.dark;

        ctx.save();
        ctx.globalAlpha = isMatch ? 1.0 : 0.15;

        // Floating ambient drop shadow
        ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
        ctx.shadowBlur = 6 * globalScale;
        ctx.shadowOffsetX = 1 * globalScale;
        ctx.shadowOffsetY = 3 * globalScale;

        // Spherical radial gradient for glossy 3D bubble look
        const grad = ctx.createRadialGradient(
            node.x - r * 0.35,
            node.y - r * 0.35,
            r * 0.08,
            node.x,
            node.y,
            r
        );
        grad.addColorStop(0, lightColor);
        grad.addColorStop(0.45, fillColor);
        grad.addColorStop(1, darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fill();

        // Selection highlight ring
        if (isSelected || isHovered) {
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5 / globalScale;
            ctx.stroke();
        }

        // Crisp navy labels beside nodes with white stroke halo
        ctx.shadowColor = 'transparent';
        const fontSize = Math.max(10, Math.min(14, 11 * nodeScale));
        ctx.font = `${node.papers > 10 || isSelected ? '600' : '400'} ${fontSize}px sans-serif`;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeText(node.name, node.x + r + 4, node.y + 4);

        ctx.fillStyle = isSelected || isHovered ? '#000000' : '#1e3a8a';
        ctx.fillText(node.name, node.x + r + 4, node.y + 4);

        ctx.restore();
    }, [nodeScale, searchQuery, hoveredNodeId, selectedNodeId, viewMode]);

    const handleExportHD = useCallback(() => {
        try {
            const fgEl = fgRef.current;
            const fgCanvas = fgEl ? fgEl.canvas : document.querySelector('canvas');
            if (!fgCanvas) return;

            const scale = 2.5;
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = fgCanvas.width * scale;
            exportCanvas.height = fgCanvas.height * scale;
            const ctx = exportCanvas.getContext('2d');
            if (!ctx) return;

            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

            // Draw ForceGraph canvas
            ctx.drawImage(
                fgCanvas,
                0,
                0,
                exportCanvas.width,
                exportCanvas.height
            );

            // Draw corner watermark logo
            const watermark = new Image();
            watermark.onload = () => {
                const logoSize = 38 * scale;
                const margin = 18 * scale;
                const x = exportCanvas.width - logoSize - margin;
                const y = margin;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                ctx.lineWidth = 1 * scale;
                ctx.fillRect(
                    x - 6 * scale,
                    y - 6 * scale,
                    logoSize + 12 * scale,
                    logoSize + 12 * scale
                );
                ctx.strokeRect(
                    x - 6 * scale,
                    y - 6 * scale,
                    logoSize + 12 * scale,
                    logoSize + 12 * scale
                );
                ctx.drawImage(watermark, x, y, logoSize, logoSize);

                const a = document.createElement('a');
                a.href = exportCanvas.toDataURL('image/png');
                a.download = 'co-authorship-novascope-hd.png';
                a.click();
            };
            watermark.src = logoImg;
        } catch (err) {
            console.error('HD Export Error:', err);
        }
    }, []);

    const toolbar = (
        <>
            <div style={styles.controlGroup}>
                <span style={styles.label}>Mode:</span>
                <div style={styles.modeSwitchGroup}>
                    <button
                        type="button"
                        style={styles.modeBtn(viewMode === 'network')}
                        onClick={() => setViewMode('network')}
                    >
                        Network
                    </button>
                    <button
                        type="button"
                        style={styles.modeBtn(viewMode === 'overlay')}
                        onClick={() => setViewMode('overlay')}
                    >
                        Overlay
                    </button>
                </div>
            </div>

            <div style={styles.controlGroup}>
                <label htmlFor="search-author" style={styles.label}>
                    Filter:
                </label>
                <input
                    id="search-author"
                    type="text"
                    placeholder="Search author..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={styles.input}
                />
            </div>

            <div style={styles.controlGroup}>
                <label htmlFor="min-weight-slider" style={styles.label}>
                    Min Collab ({minWeight}):
                </label>
                <input
                    id="min-weight-slider"
                    type="range"
                    min="1"
                    max="7"
                    value={minWeight}
                    onChange={e => setMinWeight(Number(e.target.value))}
                    style={{ cursor: 'pointer', width: '60px' }}
                />
            </div>

            <div style={styles.controlGroup}>
                <label htmlFor="node-scale-slider" style={styles.label}>
                    Size:
                </label>
                <input
                    id="node-scale-slider"
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={nodeScale}
                    onChange={e => setNodeScale(Number(e.target.value))}
                    style={{ cursor: 'pointer', width: '60px' }}
                />
            </div>

            <div style={styles.controlGroup}>
                <button
                    type="button"
                    style={styles.fitBtn}
                    onClick={() => fgRef.current && fgRef.current.zoomToFit(400)}
                >
                    Center
                </button>
                <button
                    type="button"
                    style={styles.exportBtn}
                    onClick={handleExportHD}
                    data-testid="export-hd-btn"
                >
                    Download HD
                </button>
            </div>
        </>
    );

    const footer = selectedNode ? (
        <div>
            <strong>Author:</strong> {selectedNode.name} |{' '}
            <strong>Citations:</strong> {selectedNode.citations?.toLocaleString() || 0} |{' '}
            <strong>Publications:</strong> {selectedNode.papers} |{' '}
            <strong>Cluster:</strong> {clusters[selectedNode.group]?.name || 'Collaboration Cluster'}
        </div>
    ) : null;

    return (
        <AnalysisPageTemplate
            title="Co-authorship Network"
            subtitle="Novascope D3 force simulation: Radial cluster dynamics and convex co-authorship relationships."
            toolbar={toolbar}
            footer={footer}
            dataTestId="coauthorship-network-view"
        >
            <div style={styles.canvasWrapper} data-testid="coauthorship-force-graph-wrapper">
                <div style={styles.watermark}>
                    <img
                        src={logoImg}
                        alt="Logo Watermark"
                        style={styles.logoImage}
                        data-testid="corner-watermark-logo"
                    />
                </div>

                <div style={styles.legendPanel} data-testid="vosviewer-legend">
                    <span style={{ ...styles.label, fontSize: '10px', color: '#64748b' }}>
                        {viewMode === 'network' ? 'CLUSTERS' : 'AVG YEAR'}
                    </span>
                    {viewMode === 'network' ? (
                        Object.entries(clusters).map(([gid, c]) => (
                            <div key={gid} style={styles.legendItem}>
                                <div style={styles.legendDot(c.color)} />
                                <span>{c.name}</span>
                            </div>
                        ))
                    ) : (
                        <>
                            <div style={styles.legendItem}>
                                <div style={styles.legendDot('#3b82f6')} />
                                <span>&le; 2016</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={styles.legendDot('#10b981')} />
                                <span>2017 - 2019</span>
                            </div>
                            <div style={styles.legendItem}>
                                <div style={styles.legendDot('#facc15')} />
                                <span>&ge; 2020</span>
                            </div>
                        </>
                    )}
                </div>

                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    backgroundColor="#ffffff"
                    nodeCanvasObject={paintNode}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        const r = Math.max(3, (7 + Math.sqrt(node.papers || 1) * 3) * nodeScale);
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    linkCurvature={0.22}
                    linkColor={link => {
                        const sGroup =
                            typeof link.source === 'object'
                                ? link.source.group
                                : 1;
                        const pal = CLUSTER_COLORS[sGroup] || CLUSTER_COLORS[1];
                        return pal.base;
                    }}
                    linkWidth={link => Math.max(1, (link.weight || 1) * 0.7)}
                    linkDirectionalParticles={0}
                    onNodeClick={node => setSelectedNodeId(node.id)}
                    onNodeHover={node => setHoveredNodeId(node ? node.id : null)}
                    cooldownTicks={120}
                    d3AlphaDecay={0.02}
                    d3VelocityDecay={0.3}
                />
            </div>
        </AnalysisPageTemplate>
    );
}