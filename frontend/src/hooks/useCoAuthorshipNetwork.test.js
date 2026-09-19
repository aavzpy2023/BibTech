import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useCoAuthorshipNetwork from './useCoAuthorshipNetwork';

describe('useCoAuthorshipNetwork', () => {
    it('initializes with default nodes and links', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());
        
        expect(result.current.nodes.length).toBeGreaterThan(0);
        expect(result.current.links.length).toBeGreaterThan(0);
        expect(result.current.minWeight).toBe(1);
    });

    it('filters edges when minWeight threshold increases', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());
        const initialLinkCount = result.current.links.length;
        
        act(() => {
            result.current.setMinWeight(5);
        });

        expect(result.current.minWeight).toBe(5);
        expect(result.current.links.length).toBeLessThan(initialLinkCount);
    });

    it('updates selected and hovered nodes correctly', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());
        
        act(() => {
            result.current.setSelectedNodeId('1');
            result.current.setHoveredNodeId('2');
        });

        expect(result.current.selectedNodeId).toBe('1');
        expect(result.current.hoveredNodeId).toBe('2');
    });

    it('returns raw topology without any spatial geometry logic', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());
        
        expect(result.current.nodes[0]).not.toHaveProperty('z2');
        expect(result.current.nodes[0]).not.toHaveProperty('scale');
        expect(result.current.rotation).toBeUndefined();
    });

    it('supports VOSviewer view mode toggling between network and overlay', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());

        expect(result.current.viewMode).toBe('network');

        act(() => {
            result.current.setViewMode('overlay');
        });

        expect(result.current.viewMode).toBe('overlay');
    });

    it('supports node scaling state management', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());

        expect(result.current.nodeScale).toBe(1);

        act(() => {
            result.current.setNodeScale(1.5);
        });

        expect(result.current.nodeScale).toBe(1.5);
        expect(result.current.is3DMode).toBeUndefined();
    });
});