import { describe, it, expect, vi } from 'vitest';
import { drawNode, drawLink } from './networkRender';

describe('networkRender (Nodes & Links)', () => {
    it('drawNode utilizes radial gradients for 3D sphere effects', () => {
        const mockGradient = {
            addColorStop: vi.fn()
        };
        const ctx = {
            beginPath: vi.fn(),
            arc: vi.fn(),
            createRadialGradient: vi.fn(() => mockGradient),
            fill: vi.fn(),
            fillStyle: null
        };
        const node = { x: 50, y: 50, group: 1, papers: 10 };

        drawNode(node, ctx, 1);

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.arc).toHaveBeenCalled();
        expect(ctx.createRadialGradient).toHaveBeenCalled();
        expect(mockGradient.addColorStop).toHaveBeenCalledTimes(3);
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('drawLink utilizes bezier curves for smooth connections', () => {
        const ctx = {
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            stroke: vi.fn(),
            strokeStyle: null,
            lineWidth: 0
        };
        const link = {
            source: { x: 0, y: 0 },
            target: { x: 100, y: 100 },
            weight: 5
        };

        drawLink(link, ctx, 1);

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
        expect(ctx.bezierCurveTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });
});