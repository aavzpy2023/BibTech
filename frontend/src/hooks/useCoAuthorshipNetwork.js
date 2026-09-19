import React, { useState, useMemo, useCallback } from 'react';

const DEFAULT_NODES_3D = [
    {
        id: '1',
        name: 'Vaswani, A.',
        papers: 14,
        citations: 12400,
        avgYear: 2018.5,
        group: 1,
        x: -110,
        y: -20,
        z: 90
    },
    {
        id: '2',
        name: 'Shazeer, N.',
        papers: 12,
        citations: 9800,
        avgYear: 2019.2,
        group: 1,
        x: -40,
        y: -70,
        z: 50
    },
    {
        id: '3',
        name: 'Parmar, N.',
        papers: 10,
        citations: 7500,
        avgYear: 2019.0,
        group: 1,
        x: -130,
        y: -90,
        z: -20
    },
    {
        id: '4',
        name: 'Uszkoreit, J.',
        papers: 9,
        citations: 6900,
        avgYear: 2018.2,
        group: 1,
        x: -20,
        y: 30,
        z: 80
    },
    {
        id: '5',
        name: 'Jones, L.',
        papers: 8,
        citations: 5400,
        avgYear: 2017.9,
        group: 1,
        x: -70,
        y: 80,
        z: 30
    },
    {
        id: '6',
        name: 'Gomez, A. N.',
        papers: 7,
        citations: 4900,
        avgYear: 2019.8,
        group: 1,
        x: -160,
        y: 40,
        z: -50
    },
    {
        id: '7',
        name: 'Kaiser, L.',
        papers: 11,
        citations: 8600,
        avgYear: 2020.1,
        group: 1,
        x: -110,
        y: 110,
        z: -10
    },
    {
        id: '8',
        name: 'Polosukhin, I.',
        papers: 6,
        citations: 4100,
        avgYear: 2017.5,
        group: 1,
        x: -190,
        y: -30,
        z: 20
    },
    {
        id: '9',
        name: 'Bengio, Y.',
        papers: 24,
        citations: 28900,
        avgYear: 2016.4,
        group: 2,
        x: 130,
        y: -10,
        z: -60
    },
    {
        id: '10',
        name: 'LeCun, Y.',
        papers: 21,
        citations: 24500,
        avgYear: 2015.8,
        group: 2,
        x: 190,
        y: -60,
        z: 60
    },
    {
        id: '11',
        name: 'Hinton, G.',
        papers: 19,
        citations: 26100,
        avgYear: 2015.2,
        group: 2,
        x: 150,
        y: 90,
        z: 70
    },
    {
        id: '12',
        name: 'Goodfellow, I.',
        papers: 15,
        citations: 19200,
        avgYear: 2017.1,
        group: 2,
        x: 80,
        y: 50,
        z: -70
    }
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
    { source: '1', target: '9', weight: 2 }
];

const CLUSTER_METADATA = {
    1: { name: 'Attention & Transformers', color: '#f87171' },
    2: { name: 'Deep Learning Foundations', color: '#60a5fa' }
};

const INITIAL_ROTATION = { rotX: 15, rotY: 25 };

export default function useCoAuthorshipNetwork() {
    const [nodeScale, setNodeScale] = useState(1);
    const [is3DMode, setIs3DMode] = useState(true);
    const [dynamicNodes, setDynamicNodes] = useState(null);
    const [dynamicLinks, setDynamicLinks] = useState(null);
    const [dynamicClusters, setDynamicClusters] = useState(null);
    const [minWeight, setMinWeight] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [viewMode, setViewMode] = useState('network');
    const [rotation, setRotation] = useState(INITIAL_ROTATION);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    React.useEffect(() => {
        let isMounted = true;
        fetch('/api/bibliography/network/co-authorship')
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (isMounted && data && data.nodes && data.nodes.length > 0) {
                    setDynamicNodes(data.nodes);
                    setDynamicLinks(data.links);
                    if (data.clusters) {
                        setDynamicClusters(data.clusters);
                    }
                }
            })
            .catch(() => {
                // Fallback to static distribution on failure or testing
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const resetRotation = useCallback(() => {
        setRotation(INITIAL_ROTATION);
    }, []);

    const sourceNodes = dynamicNodes || DEFAULT_NODES_3D;
    const sourceLinks = dynamicLinks || DEFAULT_LINKS;
    const sourceClusters = dynamicClusters || CLUSTER_METADATA;

    const filteredLinks = useMemo(() => {
        return sourceLinks.filter(link => link.weight >= minWeight);
    }, [sourceLinks, minWeight]);

    const activeNodeIds = useMemo(() => {
        const set = new Set();
        filteredLinks.forEach(l => {
            set.add(l.source);
            set.add(l.target);
        });
        return set;
    }, [filteredLinks]);

    const projectedNodes = useMemo(() => {
        const radX = is3DMode ? (rotation.rotX * Math.PI) / 180 : 0;
        const radY = is3DMode ? (rotation.rotY * Math.PI) / 180 : 0;
        const focalLength = 460;
        const cx = 390;
        const cy = 200;

        const projected = sourceNodes
            .filter(n => activeNodeIds.has(n.id))
            .map(n => {
                const x1 = is3DMode ? n.x * Math.cos(radY) + n.z * Math.sin(radY) : n.x;
                const z1 = is3DMode ? -n.x * Math.sin(radY) + n.z * Math.cos(radY) : 0;
                const y2 = is3DMode ? n.y * Math.cos(radX) - z1 * Math.sin(radX) : n.y;
                const z2 = is3DMode ? n.y * Math.sin(radX) + z1 * Math.cos(radX) : 0;

                const scale = focalLength / (focalLength + z2);
                const px = cx + x1 * scale;
                const py = cy + y2 * scale;
                const baseRadius = (7 + Math.sqrt(n.papers) * 2.8) * nodeScale;
                const radius = baseRadius * scale;
                const depthOpacity = is3DMode 
                    ? Math.max(0.4, Math.min(1.0, (z2 + 200) / 360))
                    : 1.0;

                return {
                    ...n,
                    px,
                    py,
                    z2,
                    scale,
                    radius,
                    depthOpacity
                };
            });

        return projected.sort((a, b) => a.z2 - b.z2);
    }, [rotation, activeNodeIds, sourceNodes, is3DMode, nodeScale]);

    const handleMouseDown = useCallback((e) => {
        if (!is3DMode) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    }, [is3DMode]);

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging || !is3DMode) return;
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            setDragStart({ x: e.clientX, y: e.clientY });

            setRotation(prev => ({
                rotX: Math.max(-65, Math.min(65, prev.rotX - deltaY * 0.45)),
                rotY: (prev.rotY + deltaX * 0.45) % 360
            }));
        },
        [isDragging, dragStart, is3DMode]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const selectedNode = useMemo(() => {
        return sourceNodes.find(n => n.id === selectedNodeId) || null;
    }, [selectedNodeId, sourceNodes]);

    return {
        nodes: projectedNodes,
        links: filteredLinks,
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
        clusters: sourceClusters,
        rotation,
        setRotation,
        resetRotation,
        nodeScale,
        setNodeScale,
        is3DMode,
        setIs3DMode,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
}