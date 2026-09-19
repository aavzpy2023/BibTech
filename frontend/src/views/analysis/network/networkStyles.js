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
export const calculateRadius = (metric, scale = 1) => {
    const value = Math.max(0, metric || 0);
    return Math.min(28, 5 + Math.sqrt(value) * 2.5) * scale;
};