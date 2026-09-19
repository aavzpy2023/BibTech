import React, { useRef, useCallback } from 'react';
import useCoAuthorshipNetwork from '../../hooks/useCoAuthorshipNetwork';
import AnalysisPageTemplate from './AnalysisPageTemplate';
import logoImg from '../../assets/logo.png';

// Novascope Bubble Palettes
const GROUP_PALETTES = {
    1: { base: '#ef4444', text: '#1e3a8a' }, // Red
    2: { base: '#3b82f6', text: '#1e3a8a' }, // Blue
    3: { base: '#10b981', text: '#1e3a8a' }, // Green
    4: { base: '#06b6d4', text: '#1e3a8a' }  // Cyan
};

// VOSviewer Overlay (Timeline gradient blue -> teal -> yellow)
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
    resetBtn: {
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
        width: '100%'
    },
    watermark: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '4px',
        borderRadius: '6px',
        backgroundColor: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid rgba(48, 54, 61, 0.6)'
    },
    logoImage: {
        width: '28px',
        height: '28px',
        objectFit: 'contain'
    },
    legendPanel: {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        zIndex: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        borderRadius: '6px',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        backdropFilter: 'blur(4px)',
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
    const svgRef = useRef(null);

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
        resetRotation,
        nodeScale,
        setNodeScale,
        is3DMode,
        setIs3DMode,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    } = useCoAuthorshipNetwork();

    const nodeMap = React.useMemo(() => {
        const map = new Map();
        nodes.forEach(n => map.set(n.id, n));
        return map;
    }, [nodes]);

    const handleExportHD = useCallback(() => {
        if (!svgRef.current) return;
        try {
            const svg = svgRef.current;
            const serializer = new XMLSerializer();
            const svgStr = serializer.serializeToString(svg);
            const blob = new Blob(
                [svgStr],
                { type: 'image/svg+xml;charset=utf-8' }
            );
            const url = URL.createObjectURL(blob);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext ? canvas.getContext('2d') : null;

            if (!ctx) {
                const a = document.createElement('a');
                a.href = url;
                a.download = 'co-authorship-vosviewer-hd.svg';
                a.click();
                URL.revokeObjectURL(url);
                return;
            }

            const scale = 3;
            canvas.width = 780 * scale;
            canvas.height = 480 * scale;

            const triggerDownload = (dataUrl) => {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'co-authorship-vosviewer-hd.png';
                a.click();
                URL.revokeObjectURL(url);
            };

            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const watermark = new Image();
                watermark.onload = () => {
                    const logoSize = 34 * scale;
                    const margin = 16 * scale;
                    const badgePad = 6 * scale;
                    const x = canvas.width - logoSize - margin;
                    const y = margin;

                    ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
                    ctx.strokeStyle = 'rgba(48, 54, 61, 0.8)';
                    ctx.lineWidth = 1 * scale;
                    if (ctx.roundRect) {
                        ctx.beginPath();
                        ctx.roundRect(
                            x - badgePad,
                            y - badgePad,
                            logoSize + badgePad * 2,
                            logoSize + badgePad * 2,
                            6 * scale
                        );
                        ctx.fill();
                        ctx.stroke();
                    } else {
                        ctx.fillRect(
                            x - badgePad,
                            y - badgePad,
                            logoSize + badgePad * 2,
                            logoSize + badgePad * 2
                        );
                    }

                    ctx.drawImage(watermark, x, y, logoSize, logoSize);
                    triggerDownload(canvas.toDataURL('image/png'));
                };

                watermark.onerror = () => {
                    triggerDownload(canvas.toDataURL('image/png'));
                };

                watermark.src = logoImg;
            };
            img.src = url;
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
                <div style={{ ...styles.modeSwitchGroup, marginLeft: '8px' }}>
                    <button
                        type="button"
                        style={styles.modeBtn(!is3DMode)}
                        onClick={() => setIs3DMode(false)}
                    >
                        2D
                    </button>
                    <button
                        type="button"
                        style={styles.modeBtn(is3DMode)}
                        onClick={() => setIs3DMode(true)}
                    >
                        3D
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
                    Min Links ({minWeight}):
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
                    max="3.0"
                    step="0.1"
                    value={nodeScale}
                    onChange={e => setNodeScale(Number(e.target.value))}
                    style={{ cursor: 'pointer', width: '60px' }}
                />
            </div>

            <div style={styles.controlGroup}>
                {is3DMode && (
                    <button
                        type="button"
                        style={styles.resetBtn}
                        onClick={resetRotation}
                    >
                        Reset 3D View
                    </button>
                )}
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
            <strong>Selected:</strong> {selectedNode.name} |{' '}
            <strong>Citations:</strong> {selectedNode.citations.toLocaleString()} |{' '}
            <strong>Publications:</strong> {selectedNode.papers} |{' '}
            <strong>Avg Pub Year:</strong> {selectedNode.avgYear.toFixed(1)} |{' '}
            <strong>Cluster:</strong> {clusters[selectedNode.group]?.name}
        </div>
    ) : null;

    return (
        <AnalysisPageTemplate
            title="Co-authorship Network"
            subtitle="VOSviewer scientometric landscape: Clusters, link strengths and co-authorship density."
            toolbar={toolbar}
            footer={footer}
            dataTestId="coauthorship-network-view"
        >
            <div style={styles.canvasWrapper}>
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
                        {viewMode === 'network' ? 'CLUSTERS' : 'AVG PUB YEAR'}
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

                <svg
                    ref={svgRef}
                    data-testid="coauthorship-svg"
                    width="100%"
                    height="520"
                    viewBox="0 0 780 500"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '6px',
                        cursor: is3DMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        userSelect: 'none'
                    }}
                >
                    <defs>
                        <radialGradient id="sphereGrad1" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#fca5a5" />
                            <stop offset="45%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                        </radialGradient>
                        <radialGradient id="sphereGrad2" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#93c5fd" />
                            <stop offset="45%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1e3a8a" />
                        </radialGradient>
                        <radialGradient id="sphereGrad3" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#6ee7b7" />
                            <stop offset="45%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#064e3b" />
                        </radialGradient>
                        <radialGradient id="sphereGrad4" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#67e8f9" />
                            <stop offset="45%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#164e63" />
                        </radialGradient>
                    </defs>

                    {/* Glossy Colored Curved Links */}
                    {links.map((link, idx) => {
                        const s = nodeMap.get(link.source);
                        const t = nodeMap.get(link.target);
                        if (!s || !t) return null;

                        const isFocused =
                            hoveredNodeId === s.id ||
                            hoveredNodeId === t.id ||
                            selectedNodeId === s.id ||
                            selectedNodeId === t.id;

                        const hasFocusActive = Boolean(
                            hoveredNodeId || selectedNodeId
                        );
                        const edgeOpacity = isFocused
                            ? 0.8
                            : hasFocusActive
                            ? 0.04
                            : is3DMode
                            ? ((s.depthOpacity + t.depthOpacity) / 2) * 0.2
                            : 0.25;

                        const dx = t.px - s.px;
                        const dy = t.py - s.py;
                        const midX = (s.px + t.px) / 2;
                        const midY = (s.py + t.py) / 2;
                        
                        const nx = -dy;
                        const ny = dx;
                        
                        // Generates convex sweeping arcs proportional to distance
                        const cx = midX + nx * 0.2;
                        const cy = midY + ny * 0.2;

                        const strokeWidth =
                            Math.max(1, link.weight * ((s.scale + t.scale) / 2) * 0.5);
                        
                        const sourcePalette = GROUP_PALETTES[s.group] || GROUP_PALETTES[1];

                        return (
                            <path
                                key={`link-${idx}`}
                                d={`M ${s.px} ${s.py} Q ${cx} ${cy} ${t.px} ${t.py}`}
                                fill="none"
                                stroke={isFocused ? '#000000' : sourcePalette.base}
                                strokeWidth={strokeWidth}
                                strokeOpacity={edgeOpacity}
                            />
                        );
                    })}

                    {/* Glossy 3D Nodes and Clean Typography */}
                    {nodes.map(node => {
                        const isMatch =
                            searchQuery.trim() === '' ||
                            node.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());
                        const isSelected = selectedNodeId === node.id;
                        const isHovered = hoveredNodeId === node.id;

                        const gradId = `url(#sphereGrad${node.group || 1})`;

                        return (
                            <g
                                key={`node-${node.id}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNodeId(node.id);
                                }}
                                onMouseEnter={() => setHoveredNodeId(node.id)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* 3D Bubble Sphere - Full Opacity in 2D Foreground */}
                                <circle
                                    cx={node.px}
                                    cy={node.py}
                                    r={node.radius}
                                    fill={viewMode === 'network' ? gradId : getOverlayColor(node.avgYear)}
                                    fillOpacity={
                                        isMatch
                                            ? is3DMode
                                                ? node.depthOpacity
                                                : 1.0
                                            : 0.15
                                    }
                                    stroke={isSelected || isHovered ? '#000000' : 'none'}
                                    strokeWidth={isSelected || isHovered ? 2 : 0}
                                />

                                {/* Clean Navy Labels in Foreground */}
                                <text
                                    x={node.px + node.radius + 6}
                                    y={node.py + 4}
                                    textAnchor="start"
                                    fill={isSelected || isHovered ? '#000000' : '#1e3a8a'}
                                    fillOpacity={
                                        isMatch
                                            ? is3DMode
                                                ? Math.max(0.75, node.depthOpacity)
                                                : 1.0
                                            : 0.15
                                    }
                                    fontSize={`${Math.max(10, Math.round(12 * node.scale))}px`}
                                    fontWeight={isSelected || node.papers > 8 ? '600' : '400'}
                                    style={{
                                        paintOrder: 'stroke fill',
                                        stroke: '#ffffff',
                                        strokeWidth: '2.5px',
                                        strokeLinejoin: 'round'
                                    }}
                                >
                                    {node.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </AnalysisPageTemplate>
    );
}