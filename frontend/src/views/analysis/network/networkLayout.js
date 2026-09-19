import * as d3 from 'd3';
import { calculateRadius, assignNodeRadii } from './networkStyles';

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

    // Radio de cada nodo normalizado DENTRO de su propio grupo/color (ver
    // networkStyles.js). Debe hacerse antes de usar calculateRadius más abajo.
    assignNodeRadii(layoutNodes);

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
    const nodeById = Object.fromEntries(layoutNodes.map(n => [n.id, n]));
    const areaOf = comp => comp.reduce((s, id) => {
        const r = calculateRadius(nodeById[id]) + 6;
        return s + Math.PI * r * r;
    }, 0);
    const estRadius = comp => Math.sqrt(areaOf(comp) / 0.5 / Math.PI);

    const aspect = 1.25; // silueta más cuadrada/redondeada (antes 1.6, 16:10)
    const ex = Math.sqrt(aspect), ey = 1 / ex;
    const compCenters = [];
    const goldenAngle = 2.39996323; // radians
    const Rg = components.length > 0 ? estRadius(components[0]) : 0;

    components.forEach((comp, i) => {
        if (i === 0) return compCenters.push({ x: 0, y: 0 });
        // Compactar islas satélite hacia los huecos del hub central
        const dist = (Rg + estRadius(comp)) * 0.82 + 3 + Math.sqrt(i) * 5;
        const a = i * goldenAngle;
        compCenters.push({ x: Math.cos(a) * dist * ex, y: Math.sin(a) * dist * ey });
    });

    // Initialize positions near their assigned centers
    const rnd = d3.randomLcg(42);
    layoutNodes.forEach(n => {
        const center = compCenters[nodeToComp[n.id]];
        n.x = center.x + (rnd() - 0.5) * 30;
        n.y = center.y + (rnd() - 0.5) * 30;
    });

    // Stage D: Force-directed refinement
    const simulation = d3.forceSimulation(layoutNodes)
    .force('link', d3.forceLink(layoutLinks).id(d => d.id).distance(28))
    .force('charge', d3.forceManyBody().strength(d => -16 - calculateRadius(d) * 3.5))
    .force('collide', d3.forceCollide().radius(d => calculateRadius(d) + 2).iterations(4))
    .force('radial', d3.forceRadial(0, 0, 0).strength(0.035))
    .force('x', d3.forceX(d => compCenters[nodeToComp[d.id]].x)
    .strength(d => nodeToComp[d.id] === 0 ? 0.03 : 0.1))     // antes 0.02 / 0.15: más orgánico
    .force('y', d3.forceY(d => compCenters[nodeToComp[d.id]].y)
    .strength(d => nodeToComp[d.id] === 0 ? 0.03 : 0.1))
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

        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        const cur = Math.max(0.1, (maxX - minX) / Math.max(1, maxY - minY));
        const target = 1.25; // Target aspect ratio (antes 1.6, debe coincidir con `aspect` de arriba)
        const stretch = Math.min(1.18, Math.max(target / cur, cur / target));
        const sx = cur < target ? stretch : 1;
        const sy = cur > target ? stretch : 1;

        layoutNodes.forEach(node => {
            node.x = (node.x - cx) * sx;
            node.y = (node.y - cy) * sy;
            node.fx = node.x;
            node.fy = node.y;
        });

        return { nodes: layoutNodes, links: layoutLinks };
};
