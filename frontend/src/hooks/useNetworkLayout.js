import { useState, useEffect } from 'react';
import { calculateStaticLayout } from '../views/analysis/network/networkLayout';

/**
 * State Fractality Hook: Pre-calculates physical graph forces asynchronously.
 * Prevents UI thread blocking while D3 ticks 300 times in the background.
 */
const layoutCache = new Map();

function getLayoutKey(nodes, links) {
    if (!nodes || nodes.length === 0) return null;
    const nSig = nodes.map(n => `${n.id}:${n.group}`).join(',');
    const lSig = links.map(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source;
        const t = typeof l.target === 'object' ? l.target.id : l.target;
        return `${s}-${t}:${l.weight}`;
    }).join(',');
    return `${nSig}##${lSig}`;
}

export default function useNetworkLayout(rawNodes, rawLinks) {
    const cacheKey = getLayoutKey(rawNodes, rawLinks);
    const [frozenData, setFrozenData] = useState(() => {
        if (cacheKey && layoutCache.has(cacheKey)) {
            return layoutCache.get(cacheKey);
        }
        return { nodes: [], links: [] };
    });
    const [isCalculating, setIsCalculating] = useState(() => {
        if (!rawNodes || rawNodes.length === 0) return false;
        return !cacheKey || !layoutCache.has(cacheKey);
    });

    useEffect(() => {
        if (!rawNodes || rawNodes.length === 0) {
            setFrozenData({ nodes: [], links: [] });
            setIsCalculating(false);
            return;
        }

        if (cacheKey && layoutCache.has(cacheKey)) {
            setFrozenData(layoutCache.get(cacheKey));
            setIsCalculating(false);
            return;
        }

        setIsCalculating(true);
        
        // Relieve the main thread rendering cycle by deferring the heavy math
        const timer = setTimeout(() => {
            const staticData = calculateStaticLayout(rawNodes, rawLinks);
            if (cacheKey) {
                layoutCache.set(cacheKey, staticData);
            }
            setFrozenData(staticData);
            setIsCalculating(false);
        }, 0);

        return () => clearTimeout(timer);
    }, [rawNodes, rawLinks, cacheKey]);

    return { frozenData, isCalculating };
}