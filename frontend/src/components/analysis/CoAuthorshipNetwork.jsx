import React, { useRef, useCallback } from 'react';
import useCoAuthorshipNetwork from '../../hooks/useCoAuthorshipNetwork';
import AnalysisPageTemplate from './AnalysisPageTemplate';
import logoImg from '../../assets/logo.png';

const GROUP_PALETTES = {
    1: { base: '#58a6ff', glow: '#1f6feb', highlight: '#79c0ff' },
    2: { base: '#3fb950', glow: '#238636', highlight: '#56d364' },
    3: { base: '#d29922', glow: '#9e6a03', highlight: '#e3b341' }
};

const styles = {
    controlGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    label: {
        fontSize: '13px',
        color: '#c9d1d9',
        fontWeight: '500'
    },
    input: {
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '6px 12px',
        color: '#f0f6fc',
        fontSize: '13px',
        outline: 'none'
    },
    stats: {
        fontSize: '13px',
        color: '#8b949e',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    resetBtn: {
        backgroundColor: '#21262d',
        color: '#f0f6fc',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    hintBadge: {
        fontSize: '11px',
        color: '#58a6ff',
        backgroundColor: '#0d1117',
        padding: '2px 8px',
        borderRadius: '12px',
        border: '1px solid #30363d'
    },
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
        backgroundColor: 'rgba(13, 17, 23, 0.75)',
        border: '1px solid rgba(48, 54, 61, 0.6)'
    },
    logoImage: {
        width: '28px',
        height: '28px',
        objectFit: 'contain'
    }
};

export default function CoAuthorshipNetwork() {
    const svgRef = useRef(null);

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
                a.download = 'co-authorship-network-hd.svg';
                a.click();
                URL.revokeObjectURL(url);
                return;
            }

            const scale = 3;
            canvas.width = 780 * scale;
            canvas.height = 460 * scale;

            const triggerDownload = (dataUrl) => {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'co-authorship-network-hd.png';
                a.click();
                URL.revokeObjectURL(url);
            };

            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = '#0a0d12';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Draw logo watermark directly onto exported canvas in HD
                const watermark = new Image();
                watermark.onload = () => {
                    const logoSize = 32 * scale;
                    const margin = 16 * scale;
                    const badgePad = 6 * scale;
                    const x = canvas.width - logoSize - margin;
                    const y = margin;

                    ctx.fillStyle = 'rgba(13, 17, 23, 0.85)';
                    ctx.strokeStyle = 'rgba(48, 54, 61, 0.7)';
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
        resetRotation,
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

    const toolbar = (
        <>
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
                    style={{ cursor: 'pointer' }}
                />
            </div>

            <div style={styles.stats}>
                <span style={styles.hintBadge}>3D Orbit: Drag to Rotate</span>
                <button
                    type="button"
                    style={styles.resetBtn}
                    onClick={resetRotation}
                >
                    Reset 3D View
                </button>
                <span>
                    Nodes: <strong>{nodes.length}</strong> | Links:{' '}
                    <strong>{links.length}</strong>
                </span>
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
            <strong>Selected Author:</strong> {selectedNode.name} |{' '}
            <strong>Cluster:</strong> {selectedNode.group} |{' '}
            <strong>Total Publications:</strong> {selectedNode.papers}
        </div>
    ) : null;

    return (
        <AnalysisPageTemplate
            title="Co-authorship Network"
            subtitle="Mapping collaboration patterns and author clusters across publications."
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
                <svg
                    ref={svgRef}
                    data-testid="coauthorship-svg"
                    width="100%"
                    height="460"
                viewBox="0 0 780 400"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    backgroundColor: '#0a0d12',
                    borderRadius: '6px',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none'
                }}
            >
                <defs>
                    <radialGradient id="sphereGrad1" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#79c0ff" />
                        <stop offset="60%" stopColor="#1f6feb" />
                        <stop offset="100%" stopColor="#0d1117" />
                    </radialGradient>
                    <radialGradient id="sphereGrad2" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#7ee787" />
                        <stop offset="60%" stopColor="#238636" />
                        <stop offset="100%" stopColor="#0d1117" />
                    </radialGradient>
                    <radialGradient id="sphereGrad3" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#f2cc60" />
                        <stop offset="60%" stopColor="#9e6a03" />
                        <stop offset="100%" stopColor="#0d1117" />
                    </radialGradient>
                </defs>

                {/* 3D Depth Edges */}
                {links.map((link, idx) => {
                    const s = nodeMap.get(link.source);
                    const t = nodeMap.get(link.target);
                    if (!s || !t) return null;

                    const isHighlighted =
                        hoveredNodeId === s.id ||
                        hoveredNodeId === t.id ||
                        selectedNodeId === s.id ||
                        selectedNodeId === t.id;

                    const avgDepthOpacity = (s.depthOpacity + t.depthOpacity) / 2;
                    const strokeWidth =
                        Math.max(1, link.weight * ((s.scale + t.scale) / 2) * 0.9);

                    return (
                        <line
                            key={`link-${idx}`}
                            x1={s.px}
                            y1={s.py}
                            x2={t.px}
                            y2={t.py}
                            stroke={isHighlighted ? '#79c0ff' : '#30363d'}
                            strokeWidth={strokeWidth}
                            strokeOpacity={
                                isHighlighted ? 0.95 : avgDepthOpacity * 0.45
                            }
                        />
                    );
                })}

                {/* 3D Painter's Sorted Nodes */}
                {nodes.map(node => {
                    const isMatch =
                        searchQuery.trim() === '' ||
                        node.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const gradId = `url(#sphereGrad${node.group || 1})`;
                    const palette = GROUP_PALETTES[node.group] || GROUP_PALETTES[1];

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
                            {/* 3D Ambient Glow for Foreground / Highlighted Nodes */}
                            {(isSelected || isHovered) && (
                                <circle
                                    cx={node.px}
                                    cy={node.py}
                                    r={node.radius + 6}
                                    fill={palette.highlight}
                                    fillOpacity={0.25}
                                />
                            )}

                            {/* Pseudo-3D Shaded Sphere */}
                            <circle
                                cx={node.px}
                                cy={node.py}
                                r={node.radius}
                                fill={gradId}
                                fillOpacity={isMatch ? node.depthOpacity : 0.15}
                                stroke={
                                    isSelected || isHovered
                                        ? '#f0f6fc'
                                        : palette.glow
                                }
                                strokeWidth={isSelected ? 2.5 : 1}
                            />

                            {/* Depth perspective label */}
                            <text
                                x={node.px}
                                y={node.py + node.radius + 12}
                                textAnchor="middle"
                                fill={isMatch ? '#c9d1d9' : '#484f58'}
                                fillOpacity={node.depthOpacity}
                                fontSize={`${Math.max(9, Math.round(11 * node.scale))}px`}
                                fontWeight={isSelected ? 'bold' : 'normal'}
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