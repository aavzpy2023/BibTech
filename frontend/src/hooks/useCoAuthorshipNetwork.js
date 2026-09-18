import { useState, useMemo } from 'react';

const DEFAULT_NODES = [
    { id: '1', name: 'Vaswani, A.', papers: 14, group: 1, x: 260, y: 190 },
    { id: '2', name: 'Shazeer, N.', papers: 12, group: 1, x: 330, y: 150 },
    { id: '3', name: 'Parmar, N.', papers: 10, group: 1, x: 220, y: 130 },
    { id: '4', name: 'Uszkoreit, J.', papers: 9, group: 1, x: 350, y: 220 },
    { id: '5', name: 'Jones, L.', papers: 8, group: 1, x: 290, y: 260 },
    { id: '6', name: 'Gomez, A. N.', papers: 7, group: 1, x: 200, y: 230 },
    { id: '7', name: 'Kaiser, L.', papers: 11, group: 1, x: 230, y: 300 },
    { id: '8', name: 'Polosukhin, I.', papers: 6, group: 1, x: 170, y: 180 },
    { id: '9', name: 'Bengio, Y.', papers: 24, group: 2, x: 540, y: 200 },
    { id: '10', name: 'LeCun, Y.', papers: 21, group: 2, x: 610, y: 160 },
    { id: '11', name: 'Hinton, G.', papers: 19, group: 2, x: 570, y: 280 },
    { id: '12', name: 'Goodfellow, I.', papers: 15, group: 2, x: 480, y: 240 }
];

const DEFAULT_LINKS = [
    { source: '1', target: '2', weight: 6 },
    { source: '1', target: '3', weight: 5 },
    { source: '1', target: '4', weight: 4 },
    { source: '1', target: '5', weight: 4 },
    { source: '1', target: '6', weight: 3 },
    { source: '1', target: '7', weight: 5 },
    { source: '1', target: '8', weight: 3 },
    { source: '2', target: '3', weight: 4 },
    { source: '2', target: '4', weight: 5 },
    { source: '3', target: '7', weight: 4 },
    { source: '9', target: '10', weight: 6 },
    { source: '9', target: '11', weight: 4 },
    { source: '9', target: '12', weight: 7 },
    { source: '10', target: '11', weight: 5 },
    { source: '1', target: '9', weight: 1 }
];

export default function useCoAuthorshipNetwork() {
    const [minWeight, setMinWeight] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);

    const filteredLinks = useMemo(() => {
        return DEFAULT_LINKS.filter(link => link.weight >= minWeight);
    }, [minWeight]);

    const activeNodeIds = useMemo(() => {
        const set = new Set();
        filteredLinks.forEach(l => {
            set.add(l.source);
            set.add(l.target);
        });
        return set;
    }, [filteredLinks]);

    const filteredNodes = useMemo(() => {
        return DEFAULT_NODES.filter(node => activeNodeIds.has(node.id));
    }, [activeNodeIds]);

    const selectedNode = useMemo(() => {
        return DEFAULT_NODES.find(n => n.id === selectedNodeId) || null;
    }, [selectedNodeId]);

    return {
        nodes: filteredNodes,
        links: filteredLinks,
        minWeight,
        setMinWeight,
        searchQuery,
        setSearchQuery,
        selectedNodeId,
        setSelectedNodeId,
        hoveredNodeId,
        setHoveredNodeId,
        selectedNode
    };
}