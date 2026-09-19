/**
 * Filters the network topology, strictly preserving nodes that have active links
 * and discarding orphan nodes or links that fall below the weight threshold.
 */
export const filterNetworkData = (nodes, links, minWeight) => {
    if (!nodes || !links) {
        return { nodes: [], links: [] };
    }
    
    // 1. Filter out weak links
    const filteredLinks = links.filter(link => link.weight >= minWeight);
    
    // 2. Identify nodes that remain actively connected
    const activeNodeIds = new Set();
    filteredLinks.forEach(link => {
        // Handle both raw IDs (strings) and pre-processed D3 objects ({id: '1'})
        activeNodeIds.add(link.source?.id || link.source);
        activeNodeIds.add(link.target?.id || link.target);
    });
    
    // 3. Keep only active nodes
    const filteredNodes = nodes.filter(node => activeNodeIds.has(node.id));
    
    return {
        nodes: filteredNodes,
        links: filteredLinks
    };
};