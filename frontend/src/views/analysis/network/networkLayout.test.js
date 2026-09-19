import { describe, it, expect } from 'vitest';
import { calculateStaticLayout } from './networkLayout';

describe('networkLayout', () => {
    it('calculates fx and fy for all nodes after simulation', () => {
        const nodes = [
            { id: '1', papers: 10 },
            { id: '2', papers: 5 },
            { id: '3', papers: 2 },
            { id: '4', papers: 8 },
            { id: '5', papers: 1 }
        ];
        const links = [
            { source: '1', target: '2', weight: 3 },
            { source: '1', target: '3', weight: 2 },
            { source: '2', target: '4', weight: 1 },
            { source: '4', target: '5', weight: 1 }
        ];

        const result = calculateStaticLayout(nodes, links, 800, 600);

        expect(result.nodes).toHaveLength(5);
        expect(result.links).toHaveLength(4);

        result.nodes.forEach(node => {
            expect(node.fx).toBeDefined();
            expect(node.fy).toBeDefined();
            expect(typeof node.fx).toBe('number');
            expect(typeof node.fy).toBe('number');
            // Ensure computed coordinates are strictly frozen
            expect(node.fx).toBe(node.x);
            expect(node.fy).toBe(node.y);
        });
    });

    it('handles empty inputs safely without throwing errors', () => {
        const result = calculateStaticLayout([], [], 800, 600);
        expect(result.nodes).toEqual([]);
        expect(result.links).toEqual([]);
    });
});