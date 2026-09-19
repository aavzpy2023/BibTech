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

    it('calculates 3D coordinates and updates rotation angles', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());

        expect(result.current.nodes[0]).toHaveProperty('z2');
        expect(result.current.nodes[0]).toHaveProperty('scale');

        act(() => {
            result.current.setRotation({ rotX: 45, rotY: 90 });
        });

        expect(result.current.rotation.rotX).toBe(45);
        expect(result.current.rotation.rotY).toBe(90);
    });

    it('resets 3D rotation back to initial orientation', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());

        act(() => {
            result.current.setRotation({ rotX: 30, rotY: 60 });
            result.current.resetRotation();
        });

        expect(result.current.rotation.rotX).toBe(15);
        expect(result.current.rotation.rotY).toBe(25);
    });

    it('supports VOSviewer view mode toggling between network and overlay', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());

        expect(result.current.viewMode).toBe('network');

        act(() => {
            result.current.setViewMode('overlay');
        });

        expect(result.current.viewMode).toBe('overlay');
    });

    it('supports 2D/3D mode toggling and node scaling', () => {
        const { result } = renderHook(() => useCoAuthorshipNetwork());

        expect(result.current.is3DMode).toBe(true);
        expect(result.current.nodeScale).toBe(1);

        act(() => {
            result.current.setIs3DMode(false);
            result.current.setNodeScale(1.5);
        });

        expect(result.current.is3DMode).toBe(false);
        expect(result.current.nodeScale).toBe(1.5);

        // In 2D, all nodes are on the flat foreground plane with full opacity
        expect(result.current.nodes[0].z2).toBe(0);
        expect(result.current.nodes[0].scale).toBe(1.0);
        expect(result.current.nodes[0].depthOpacity).toBe(1.0);
    });
});