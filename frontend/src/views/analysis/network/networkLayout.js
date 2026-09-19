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

    // Assign spatial centers to components to prevent vertical stacking
    const compCenters = [];
    const goldenAngle = 2.39996323; // radians
    components.forEach((comp, i) => {
        if (i === 0) {
            compCenters.push({ x: 0, y: 0 });
        } else {
            const radius = 220 + i * 55;
            const angle = i * goldenAngle;
            compCenters.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        }
    });

    // Initialize positions near their assigned centers
    layoutNodes.forEach(n => {
        const center = compCenters[nodeToComp[n.id]];
        n.x = center.x + (Math.random() - 0.5) * 30;
        n.y = center.y + (Math.random() - 0.5) * 30;
    });

    // Stage D: Force-directed refinement
    const simulation = d3.forceSimulation(layoutNodes)
        .force('link', d3.forceLink(layoutLinks).id(d => d.id).distance(55))
        .force('charge', d3.forceManyBody().strength(-120))
        .force('collide', d3.forceCollide().radius(d => calculateRadius(d) + 3).iterations(4))
        .force('x', d3.forceX(d => compCenters[nodeToComp[d.id]].x).strength(0.15))
        .force('y', d3.forceY(d => compCenters[nodeToComp[d.id]].y).strength(0.15))
        .stop();

    simulation.tick(300);

    // Bounding box and position normalization
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layoutNodes.forEach(n => {
        const r = calculateRadius(n);
        if (n.x - r < minX) minX = n.x - r;
        if (n.x + r > maxX) maxX = n.x + r;
        if (n.y - r < minY) minY = n.y - r;
        if (n.y + r > maxY) maxY = n.y + r;
    });

    const graphWidth = Math.max(1, maxX - minX);
    const graphHeight = Math.max(1, maxY - minY);
    
    // Target dimensions (75% of canvas to guarantee margins)
    const targetWidth = width * 0.75;
    const targetHeight = height * 0.75;
    
    const scaleX = targetWidth / graphWidth;
    const scaleY = targetHeight / graphHeight;
    const scale = Math.min(scaleX, scaleY, 2);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    layoutNodes.forEach(node => {
        node.x = (node.x - cx) * scale;
        node.y = (node.y - cy) * scale;
        node.fx = node.x;
        node.fy = node.y;
    });

    return { nodes: layoutNodes, links: layoutLinks };
};