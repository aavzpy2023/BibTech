import React, { useState, useMemo, useCallback } from 'react';
import { filterNetworkData } from '../views/analysis/network/networkData';

const DEFAULT_NODES_3D = [];
const DEFAULT_LINKS = [];
const CLUSTER_METADATA = {};

let cacheCoCitation = {
    gamma: null,
    data: null,
};

export default function useCoCitationNetwork() {
    const [louvainGamma, setLouvainGamma] = useState(1.0);
    const [debouncedGamma, setDebouncedGamma] = useState(1.0);
    const [dynamicNodes, setDynamicNodes] = useState(
        () => cacheCoCitation.data?.nodes || null
    );
    const [dynamicLinks, setDynamicLinks] = useState(
        () => cacheCoCitation.data?.links || null
    );
    const [dynamicClusters, setDynamicClusters] = useState(
        () => cacheCoCitation.data?.clusters || null
    );
    const [minWeight, setMinWeight] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [viewMode, setViewMode] = useState('network');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedGamma(louvainGamma);
        }, 1000);
        return () => clearTimeout(handler);
    }, [louvainGamma]);

    React.useEffect(() => {
        if (
            cacheCoCitation.gamma === debouncedGamma &&
            cacheCoCitation.data
        ) {
            setDynamicNodes(cacheCoCitation.data.nodes);
            setDynamicLinks(cacheCoCitation.data.links);
            setDynamicClusters(cacheCoCitation.data.clusters);
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        fetch(`/api/bibliography/network/co-citation?resolution=${debouncedGamma}`)
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (isMounted && data && data.nodes && data.nodes.length > 0) {
                    cacheCoCitation = {
                        gamma: debouncedGamma,
                        data: data,
                    };
                    setDynamicNodes(data.nodes);
                    setDynamicLinks(data.links);
                    if (data.clusters) {
                        setDynamicClusters(data.clusters);
                    }
                }
            })
            .catch(() => {
                // Fallback handled
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [debouncedGamma]);

    const sourceNodes = dynamicNodes || DEFAULT_NODES_3D;
    const sourceLinks = dynamicLinks || DEFAULT_LINKS;
    const sourceClusters = dynamicClusters || CLUSTER_METADATA;

    const filteredLinks = useMemo(() => {
        return sourceLinks.filter(link => link.weight >= minWeight);
    }, [sourceLinks, minWeight]);

    const { nodes: finalNodes, links: finalLinks } = useMemo(() => {
        return filterNetworkData(sourceNodes, sourceLinks, minWeight);
    }, [sourceNodes, sourceLinks, minWeight]);

    const selectedNode = useMemo(() => {
        return sourceNodes.find(n => n.id === selectedNodeId) || null;
    }, [selectedNodeId, sourceNodes]);

    return {
        nodes: finalNodes,
        links: finalLinks,
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
        louvainGamma,
        setLouvainGamma,
        isLoading
    };
}