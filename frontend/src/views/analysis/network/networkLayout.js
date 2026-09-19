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

    // Stage A: Analyze graph data
    const degreeMap = {};
    layoutNodes.forEach(n => degreeMap[n.id] = 0);
    layoutLinks.forEach(l => {
        degreeMap[l.source] = (degreeMap[l.source] || 0) + 1;
        degreeMap[l.target] = (degreeMap[l.target] || 0) + 1;
    });
    layoutNodes.forEach(n => n.degree = degreeMap[n.id]);

    const adjList = {};
    layoutNodes.forEach(n => adjList[n.id] = []);
    layoutLinks.forEach(l => {
        adjList[l.source].push(l.target);
        adjList[l.target].push(l.source);
    });

    const visited = new Set();
    const components = [];
    layoutNodes.forEach(n => {
        if (!visited.has(n.id)) {
            const comp = [];
            const queue = [n.id];
            visited.add(n.id);
            while (queue.length > 0) {
                const curr = queue.shift();
                comp.push(curr);
                adjList[curr].forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }
            components.push(comp);
        }
    });

    components.sort((a, b) => b.length - a.length);

    const nodeToComp = {};
    components.forEach((comp, i) => {
        comp.forEach(nodeId => {
            nodeToComp[nodeId] = i;
        });
    });

    // Stage D: Force-directed refinement
    const simulation = d3.forceSimulation(layoutNodes)
        .force('link', d3.forceLink(layoutLinks).id(d => d.id).distance(45))
        .force('charge', d3.forceManyBody().strength(-60))
        .force('center', d3.forceCenter(0, 0).strength(0.05))
        .force('collide', d3.forceCollide().radius(d => calculateRadius(d.papers) + 6).iterations(2))
        .force('x', d3.forceX(0).strength(d => nodeToComp[d.id] === 0 ? 0.01 : 0.08))
        .force('y', d3.forceY(0).strength(d => nodeToComp[d.id] === 0 ? 0.01 : 0.08))
        .stop();

    simulation.tick(300);

    // Bounding box and position normalization
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layoutNodes.forEach(n => {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
    });

    const graphWidth = Math.max(1, maxX - minX);
    const graphHeight = Math.max(1, maxY - minY);
    
    // Target dimensions (85% of canvas)
    const targetWidth = width * 0.85;
    const targetHeight = height * 0.85;
    
    const scaleX = targetWidth / graphWidth;
    const scaleY = targetHeight / graphHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);

    const offsetX = - (minX + maxX) / 2 * scale;
    const offsetY = - (minY + maxY) / 2 * scale;

    layoutNodes.forEach(node => {
        node.x = node.x * scale + offsetX;
        node.y = node.y * scale + offsetY;
        node.fx = node.x;
        node.fy = node.y;
    });

    return { nodes: layoutNodes, links: layoutLinks };
};