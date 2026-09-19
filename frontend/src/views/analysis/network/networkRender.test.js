import { describe, it, expect, vi } from 'vitest';
import { drawNode, drawLink, drawLabel, drawBranding } from './networkRender';

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

describe('networkRender (Labels & Branding)', () => {
    it('drawLabel renders text only if globalScale is above threshold', () => {
        const ctx = {
            fillText: vi.fn(),
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: ''
        };
        const node = { x: 10, y: 10, name: 'Test Node', papers: 5 };
        
        // Below threshold (should not render)
        drawLabel(node, ctx, 1.0);
        expect(ctx.fillText).not.toHaveBeenCalled();
        
        // Above threshold (should render)
        drawLabel(node, ctx, 2.0);
        expect(ctx.fillText).toHaveBeenCalledWith('Test Node', 10, expect.any(Number));
        expect(ctx.textAlign).toBe('center');
    });

    it('drawBranding renders the NovaScope watermark correctly', () => {
        const ctx = {
            fillText: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            font: '',
            fillStyle: '',
            textAlign: '',
            textBaseline: ''
        };
        
        drawBranding(ctx, 800, 600);
        
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalledWith('NOVASCOPE', 780, 580);
        expect(ctx.restore).toHaveBeenCalled();
    });
});