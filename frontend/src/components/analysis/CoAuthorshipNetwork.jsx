import React, { useRef, useCallback, useMemo } from 'react';
import useCoAuthorshipNetwork from '../../hooks/useCoAuthorshipNetwork';
import useNetworkLayout from '../../hooks/useNetworkLayout';
import useElementSize from '../../hooks/useElementSize';
import NetworkGraphTemplate from './NetworkGraphTemplate';
import AnalysisPageTemplate from './AnalysisPageTemplate';
import { exportCanvasToImage } from '../../views/analysis/network/exportNetwork';
import { setRenderNodes } from '../../views/analysis/network/networkRender';
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
        louvainGamma,
        setLouvainGamma,
        isLoading
    } = useCoAuthorshipNetwork();

    // Offload heavy physics calculation to the state fractality hook
    const { frozenData, isCalculating } = useNetworkLayout(nodes, links);

    React.useEffect(() => {
        if (!isCalculating && frozenData?.nodes?.length > 0) {
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
                        logoSrc: logoImg
                    })}
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
