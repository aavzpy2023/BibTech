import { describe, it, expect, vi, beforeEach } from "vitest";
import { drawLinks } from "./drawLinks";
import { drawNodes } from "./drawNodes";
import type { NetworkNode, NetworkLink } from "../types";

describe("Canvas Rendering Utilities", () => {
    let mockCtx: any;

    beforeEach(() => {
        // 1. Arrange: Mock Canvas context and geometry APIs
        mockCtx = {
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            createRadialGradient: vi.fn().mockReturnValue({
                addColorStop: vi.fn(),
            }),
        };
    });

    it("drawLinks processes coordinates and applies stroke", () => {
        // 2. Act: Execute links rendering
        const links = [
            { source: { x: 10, y: 10 }, target: { x: 50, y: 50 } }
        ] as unknown as NetworkLink[];
        
        drawLinks(mockCtx, links);

        // 3. Assert: Verify D3 structural mapping to Canvas primitives
        expect(mockCtx.beginPath).toHaveBeenCalledOnce();
        expect(mockCtx.moveTo).toHaveBeenCalledWith(10, 10);
        expect(mockCtx.lineTo).toHaveBeenCalledWith(50, 50);
        expect(mockCtx.stroke).toHaveBeenCalledOnce();
    });

    it("drawNodes generates 3D radials matching the cluster enum", () => {
        // 2. Act: Execute nodes rendering for a 'red' cluster
        const nodes: NetworkNode[] = [
            { id: "1", name: "Alpha", radius: 5, cluster: "red", x: 20, y: 20 }
        ];

        drawNodes(mockCtx, nodes);

        // 3. Assert: 3D lighting gradient offset and arc mapping
        expect(mockCtx.beginPath).toHaveBeenCalledOnce();
        expect(mockCtx.arc).toHaveBeenCalledWith(20, 20, 5, 0, 2 * Math.PI);
        expect(mockCtx.createRadialGradient).toHaveBeenCalled();
        expect(mockCtx.fill).toHaveBeenCalledOnce();
    });
});