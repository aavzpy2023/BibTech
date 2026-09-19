import { useState, useEffect } from 'react';
import { calculateStaticLayout } from '../views/analysis/network/networkLayout';

/**
 * State Fractality Hook: Pre-calculates physical graph forces asynchronously.
 * Prevents UI thread blocking while D3 ticks 300 times in the background.
 */
export default function useNetworkLayout(rawNodes, rawLinks) {
    const [frozenData, setFrozenData] = useState({ nodes: [], links: [] });
    const [isCalculating, setIsCalculating] = useState(true);

    useEffect(() => {
        if (!rawNodes || rawNodes.length === 0) {
            setFrozenData({ nodes: [], links: [] });
            setIsCalculating(false);
            return;
        }

        setIsCalculating(true);
        
        // Relieve the main thread rendering cycle by deferring the heavy math
        const timer = setTimeout(() => {
            const staticData = calculateStaticLayout(rawNodes, rawLinks);
            setFrozenData(staticData);
            setIsCalculating(false);
        }, 0);

        return () => clearTimeout(timer);
    }, [rawNodes, rawLinks]);

    return { frozenData, isCalculating };
}