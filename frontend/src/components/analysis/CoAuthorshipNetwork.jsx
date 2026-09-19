import React, { useRef, useState, useCallback, useMemo } from 'react';
import useCoAuthorshipNetwork from '../../hooks/useCoAuthorshipNetwork';
import useNetworkLayout from '../../hooks/useNetworkLayout';
import useElementSize from '../../hooks/useElementSize';
import NetworkGraphTemplate from './NetworkGraphTemplate';
import AnalysisPageTemplate from './AnalysisPageTemplate';
import { exportCanvasToImage } from '../../views/analysis/network/exportNetwork';
import { setRenderNodes, setEdgeOpacityMultiplier } from '../../views/analysis/network/networkRender';
import { fitGraphView } from '../../views/analysis/network/networkFit';
import logoImg from '../../assets/logo.png';

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
        width: 'min(100%, calc(75vh * 1.6))',
        aspectRatio: '16 / 10',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        overflow: 'hidden'
    },
    watermark: {
        position: 'absolute',
        bottom: '12px',
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

const FIT_PADDING = 24; // px de margen; el ajuste ya cuenta las etiquetas

export default function CoAuthorshipNetwork() {
    const fgRef = useRef();
    const wrapperRef = useRef();
    const size = useElementSize(wrapperRef);

    const {
        nodes,
        links,
        minWeight,
        setMinWeight,
        selectedNodeId,
        setSelectedNodeId,
        hoveredNodeId,
        setHoveredNodeId,
        selectedNode,
        clusters,
        louvainGamma,
        setLouvainGamma,
        isLoading
    } = useCoAuthorshipNetwork();

    const [edgeOpacity, setEdgeOpacity] = useState(0.35);

    // Offload heavy physics calculation to the state fractality hook
    const { frozenData, isCalculating } = useNetworkLayout(nodes, links);

    // Force canvas repaint when opacity slider changes
    React.useEffect(() => {
        setEdgeOpacityMultiplier(edgeOpacity);
        if (fgRef.current && !isCalculating) {
            if (typeof fgRef.current.refresh === 'function') {
                fgRef.current.refresh();
            }
            const currentZoom = fgRef.current.zoom?.();
            if (currentZoom != null) {
                fgRef.current.zoom(currentZoom * 1.0001);
                setTimeout(() => {
                    fgRef.current?.zoom?.(currentZoom);
                }, 10);
            }
        }
    }, [edgeOpacity, isCalculating]);

    React.useEffect(() => {
        if (!isCalculating && frozenData?.nodes?.length > 0) {
            // Reordenar nodos (pequeños primero, grandes al final) para garantizar
            // que los hubs importantes se dibujen siempre encima de la masa en Canvas (Z-Index fix)
            const sortedNodes = [...frozenData.nodes].sort((a, b) => {
                const valA = a.degree || a.radius || 0;
                const valB = b.degree || b.radius || 0;
                return valA - valB;
            });
            frozenData.nodes = sortedNodes;
            setRenderNodes(frozenData.nodes);
        }
    }, [isCalculating, frozenData]);

    // Ajusta al cargar y cada vez que cambia el tamaño REAL del contenedor.
    React.useEffect(() => {
        if (isCalculating || !frozenData?.nodes?.length || !size.width || !size.height) return undefined;
        const t = setTimeout(() => {
            fitGraphView(fgRef.current, frozenData.nodes, size.width, size.height, FIT_PADDING);
        }, 100);
        return () => clearTimeout(t);
    }, [isCalculating, frozenData, size.width, size.height]);

    const toolbar = (
        <>
            <div style={styles.controlGroup}>
                <label htmlFor="edge-opacity-slider" style={styles.label}>
                    Connections ({edgeOpacity.toFixed(2)}):
                </label>
                <input
                    id="edge-opacity-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={edgeOpacity}
                    onChange={e => setEdgeOpacity(Number(e.target.value))}
                    style={{ cursor: 'pointer', width: '60px' }}
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
                <label htmlFor="gamma-slider" style={styles.label}>
                    Louvain &gamma; ({louvainGamma.toFixed(1)}):
                </label>
                <input
                    id="gamma-slider"
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={louvainGamma}
                    onChange={e => setLouvainGamma(Number(e.target.value))}
                    style={{ cursor: 'pointer', width: '70px', accentColor: '#3b82f6' }}
                    title="Bajo: Macro-Comunidades (Instituciones). Alto: Micro-Comunidades (Laboratorios)."
                />
            </div>

            <div style={styles.controlGroup}>
                <button
                    type="button"
                    style={styles.fitBtn}
                    onClick={() => fitGraphView(fgRef.current, frozenData.nodes, size.width, size.height, FIT_PADDING)}
                >
                    Center
                </button>
                <button
                    type="button"
                    style={styles.exportBtn}
                onClick={() => exportCanvasToImage(fgRef, 'co-authorship-novascope-hd.png', {
                    nodes: frozenData.nodes,
                    links: frozenData.links,
                    clusters,
                    logoSrc: logoImg
                })}
                    data-testid="export-hd-btn"
                >
                    Download
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
            <div ref={wrapperRef} style={styles.canvasWrapper} data-testid="coauthorship-force-graph-wrapper">
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
                        CLUSTERS
                    </span>
                    {useMemo(() => {
                        if (!frozenData || !frozenData.nodes) return null;
                        const counts = {};
                        frozenData.nodes.forEach(n => {
                            counts[n.group] = (counts[n.group] || 0) + 1;
                        });
                        const top4 = Object.keys(counts)
                            .sort((a, b) => counts[b] - counts[a])
                            .slice(0, 4);

                        const items = top4.map(gid => (
                            <div key={gid} style={styles.legendItem}>
                                <div style={styles.legendDot(clusters[gid]?.color || '#9ca3af')} />
                                <span>{clusters[gid]?.name || `Cluster ${gid}`}</span>
                            </div>
                        ));
                        
                        if (Object.keys(counts).length > 4) {
                            items.push(
                                <div key="others" style={styles.legendItem}>
                                    <div style={styles.legendDot('#c9c9c9')} />
                                    <span>Others</span>
                                </div>
                            );
                        }
                        return items;
                    }, [frozenData, clusters])}
                </div>

                {(isCalculating || isLoading) ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#8b949e' }}>
                        {isLoading ? "Recalculating Community Modularity..." : "Calculating Network Physics..."}
                    </div>
                ) : (
                    <NetworkGraphTemplate
                        ref={fgRef}
                        frozenData={frozenData}
                        width={size.width || undefined}
                        height={size.height || undefined}
                        onNodeClick={node => setSelectedNodeId(node.id)}
                    />
                )}
            </div>
        </AnalysisPageTemplate>
    );
}
