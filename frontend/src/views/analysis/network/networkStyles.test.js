import { describe, it, expect } from 'vitest';
import { getNodeColor, calculateRadius } from './networkStyles';

describe('networkStyles', () => {
    it('getNodeColor returns correct hex codes based on group', () => {
        expect(getNodeColor(1)).toBe('#ef4444');
        expect(getNodeColor(2)).toBe('#3b82f6');
        expect(getNodeColor(3)).toBe('#10b981');
        expect(getNodeColor(4)).toBe('#06b6d4');
        expect(getNodeColor(999)).toBe('#9ca3af'); // Fallback case
    });

    it('calculateRadius returns bounded values based on papers metric', () => {
        // Formula: 7 + Math.sqrt(papers) * 2.8
        expect(calculateRadius(0)).toBeCloseTo(7.0);
        expect(calculateRadius(16)).toBeCloseTo(18.2);
        
        // Handles negative or undefined gracefully
        expect(calculateRadius(-5)).toBeCloseTo(7.0);
        expect(calculateRadius(undefined)).toBeCloseTo(7.0);
    });
});