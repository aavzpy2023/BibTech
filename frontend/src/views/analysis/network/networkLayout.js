import * as d3 from 'd3';
import { calculateRadius } from './networkStyles';

/**
 * Pre-calculates network physics synchronously to freeze the layout.
 * Ensures the computationally heavy force simulation runs outside the render loop.
 */
export const calculateStaticLayout = (nodes, links, width = 800, height = 600) => {
    if (!nodes || nodes.length === 0) return { nodes: [], links: [] };

    // Deep copy nodes to avoid mutating React state directly before freezing
    const layoutNodes = nodes.map(n => ({ ...n }));
    // Normalize links mapping to ensure D3 interprets the source/target properly
    const layoutLinks = links.map(l => ({
        ...l,
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target
    }));

    const simulation = d3.forceSimulation(layoutNodes)
        .force('link', d3.forceLink(layoutLinks).id(d => d.id).distance(45))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide().radius(d => calculateRadius(d.papers) + 4)
            .iterations(2))
        .stop(); // Prevent auto-running asynchronously

    // Run 300 ticks synchronously to resolve physics completely
    simulation.tick(300);

    // Freeze positions directly to fx/fy to lock the nodes statically
    layoutNodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
    });

    return {
        nodes: layoutNodes,
        links: layoutLinks
    };
};