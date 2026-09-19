export const CLUSTER_METADATA = {
    1: { name: 'Primary Collaboration Cluster', color: '#ef4444' },
    2: { name: 'Core Scientific Cluster', color: '#3b82f6' },
    3: { name: 'Emerging Research Cluster', color: '#10b981' },
    4: { name: 'Secondary Hub', color: '#06b6d4' }
};

/**
 * Returns the hex color for a given node cluster group.
 */
export const getNodeColor = (group) => {
    const cluster = CLUSTER_METADATA[group];
    return cluster ? cluster.color : '#9ca3af';
};

/**
 * Calculates a bounded radius for nodes based on their metric (e.g. papers count).
 */
export const calculateRadius = (node, scale = 1) => {
    if (!node) return 4 * scale;
    const metric = node.degree !== undefined ? node.degree : (node.citations || node.papers || 1);
    const value = Math.max(0, metric);
    return Math.min(20, 3 + Math.sqrt(value) * 2.2) * scale;
};