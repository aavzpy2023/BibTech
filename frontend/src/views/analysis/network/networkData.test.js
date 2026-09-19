import { describe, it, expect } from 'vitest';
import { filterNetworkData } from './networkData';

describe('networkData', () => {
    it('strips weak links and orphaned nodes safely', () => {
        const nodes = [
            { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
        ];
        const links = [
            { source: '1', target: '2', weight: 5 },
            { source: '2', target: '3', weight: 1 }
        ];

        const result = filterNetworkData(nodes, links, 3);

        // Only the link with weight >= 3 remains
        expect(result.links).toHaveLength(1);
        expect(result.links[0].weight).toBe(5);

        // Active nodes are 1 and 2. 3, 4, 5 are removed.
        expect(result.nodes).toHaveLength(2);
        const nodeIds = result.nodes.map(n => n.id).sort();
        expect(nodeIds).toEqual(['1', '2']);
    });

    it('handles D3 object-based links gracefully', () => {
        const nodes = [{ id: '1' }, { id: '2' }];
        const links = [{ source: { id: '1' }, target: { id: '2' }, weight: 5 }];
        
        const result = filterNetworkData(nodes, links, 1);
        expect(result.nodes).toHaveLength(2);
        expect(result.links).toHaveLength(1);
    });

    it('returns empty structures if inputs are null', () => {
        const result = filterNetworkData(null, null, 1);
        expect(result.nodes).toEqual([]);
        expect(result.links).toEqual([]);
    });
});