import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useNetworkLayout from './useNetworkLayout';
import * as networkLayout from '../views/analysis/network/networkLayout';

// Interceptamos la matemática pesada para el test
vi.mock('../views/analysis/network/networkLayout', () => ({
    calculateStaticLayout: vi.fn((nodes, links) => ({
        nodes: nodes.map(n => ({ ...n, fx: 100, fy: 100 })),
        links: links
    }))
}));

describe('useNetworkLayout', () => {
    it('manages asynchronous layout calculation state securely', async () => {
        const rawNodes = [{ id: '1' }];
        const rawLinks = [];

        const { result } = renderHook(() => useNetworkLayout(rawNodes, rawLinks));

        // Initial state should be calculating
        expect(result.current.isCalculating).toBe(true);
        expect(result.current.frozenData).toEqual({ nodes: [], links: [] });

        // Wait for setTimeout macro-task to clear
        await waitFor(() => {
            expect(result.current.isCalculating).toBe(false);
        });

        // Verify the physics engine was executed and state updated
        expect(networkLayout.calculateStaticLayout).toHaveBeenCalledWith(rawNodes, rawLinks);
        expect(result.current.frozenData.nodes).toHaveLength(1);
        expect(result.current.frozenData.nodes[0].fx).toBe(100);
    });

    it('bypasses calculation instantly for empty graphs', () => {
        const { result } = renderHook(() => useNetworkLayout([], []));
        
        expect(result.current.isCalculating).toBe(false);
        expect(result.current.frozenData).toEqual({ nodes: [], links: [] });
    });
});