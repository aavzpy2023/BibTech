import React from 'react';
import useCoAuthorshipNetwork from '../../hooks/useCoAuthorshipNetwork';

const GROUP_COLORS = {
    1: '#58a6ff',
    2: '#3fb950',
    3: '#d29922'
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto'
    },
    header: {
        borderBottom: 'none',
        paddingBottom: '8px'
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#f0f6fc',
        margin: '0 0 8px 0'
    },
    subtitle: {
        fontSize: '14px',
        color: '#8b949e',
        margin: 0
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: '12px 16px',
        gap: '16px',
        flexWrap: 'wrap'
    },
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
        color: '#8b949e'
    },
    canvasCard: {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
    },
    detailDrawer: {
        marginTop: '12px',
        padding: '12px 16px',
        backgroundColor: '#21262d',
        borderRadius: '6px',
        border: '1px solid #30363d',
        width: '100%',
        boxSizing: 'border-box',
        color: '#f0f6fc',
        fontSize: '13px'
    }
};

export default function CoAuthorshipNetwork() {
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
        selectedNode
    } = useCoAuthorshipNetwork();

    const nodeMap = React.useMemo(() => {
        const map = new Map();
        nodes.forEach(n => map.set(n.id, n));
        return map;
    }, [nodes]);

    return (
        <div style={styles.container} data-testid="coauthorship-network-view">
            <div style={styles.header}>
                <h2 style={styles.title}>Co-authorship Network</h2>
                <p style={styles.subtitle}>
                    Mapping collaboration patterns and author clusters across
                    publications.
                </p>
            </div>

            <div style={styles.toolbar}>
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
                        Min Collaborations ({minWeight}):
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
                    Nodes: <strong>{nodes.length}</strong> | Links:{' '}
                    <strong>{links.length}</strong>
                </div>
            </div>

            <div style={styles.canvasCard}>
                <svg
                    data-testid="coauthorship-svg"
                    width="100%"
                    height="420"
                    viewBox="0 0 780 400"
                    style={{ backgroundColor: '#0d1117', borderRadius: '6px' }}
                >
                    {links.map((link, idx) => {
                        const s = nodeMap.get(link.source);
                        const t = nodeMap.get(link.target);
                        if (!s || !t) return null;

                        const isHighlighted =
                            hoveredNodeId === s.id ||
                            hoveredNodeId === t.id ||
                            selectedNodeId === s.id ||
                            selectedNodeId === t.id;

                        return (
                            <line
                                key={`link-${idx}`}
                                x1={s.x}
                                y1={s.y}
                                x2={t.x}
                                y2={t.y}
                                stroke={isHighlighted ? '#58a6ff' : '#30363d'}
                                strokeWidth={link.weight}
                                strokeOpacity={isHighlighted ? 0.9 : 0.4}
                            />
                        );
                    })}

                    {nodes.map(node => {
                        const isMatch =
                            searchQuery.trim() === '' ||
                            node.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());
                        const isSelected = selectedNodeId === node.id;
                        const isHovered = hoveredNodeId === node.id;
                        const radius = 6 + Math.sqrt(node.papers) * 2.5;
                        const fillColor = GROUP_COLORS[node.group] || '#58a6ff';

                        return (
                            <g
                                key={`node-${node.id}`}
                                onClick={() => setSelectedNodeId(node.id)}
                                onMouseEnter={() => setHoveredNodeId(node.id)}
                                onMouseLeave={() => setHoveredNodeId(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={radius}
                                    fill={fillColor}
                                    fillOpacity={isMatch ? (isSelected ? 1 : 0.85) : 0.2}
                                    stroke={isSelected || isHovered ? '#f0f6fc' : '#30363d'}
                                    strokeWidth={isSelected ? 3 : 1.5}
                                />
                                <text
                                    x={node.x}
                                    y={node.y + radius + 14}
                                    textAnchor="middle"
                                    fill={isMatch ? '#c9d1d9' : '#484f58'}
                                    fontSize="11px"
                                    fontWeight={isSelected ? 'bold' : 'normal'}
                                >
                                    {node.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {selectedNode && (
                    <div style={styles.detailDrawer}>
                        <strong>Selected Author:</strong> {selectedNode.name} |{' '}
                        <strong>Cluster:</strong> {selectedNode.group} |{' '}
                        <strong>Total Publications:</strong> {selectedNode.papers}
                    </div>
                )}
            </div>
        </div>
    );
}