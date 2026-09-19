import { describe, it, expect, vi } from "vitest";
import { executeRenderFrame } from "./renderLoop";
import * as drawLinksModule from "./drawLinks";
import * as drawNodesModule from "./drawNodes";
import * as drawLabelsModule from "./drawLabels";
import type { NetworkNode, NetworkLink } from "../types";

describe("renderLoop Orchestrator", () => {
    it("clears context and invokes render utilities in strict Z-index sequence", () => {
        // 1. Arrange: Mock the Canvas context and spy on the atomic render functions
        const mockCtx = {
            clearRect: vi.fn(),
        } as unknown as CanvasRenderingContext2D;

        const drawLinksSpy = vi.spyOn(drawLinksModule, "drawLinks").mockImplementation(() => {});
        const drawNodesSpy = vi.spyOn(drawNodesModule, "drawNodes").mockImplementation(() => {});
        const drawLabelsSpy = vi.spyOn(drawLabelsModule, "drawLabels").mockImplementation(() => {});

        const nodes: NetworkNode[] = [];
        const links: NetworkLink[] = [];

        // 2. Act: Execute a single frame
        executeRenderFrame(mockCtx, 800, 600, nodes, links);

        // 3. Assert: Z-Index execution order is critical (Links -> Nodes -> Labels)
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
        expect(drawLinksSpy).toHaveBeenCalledWith(mockCtx, links);
        expect(drawNodesSpy).toHaveBeenCalledWith(mockCtx, nodes);
        expect(drawLabelsSpy).toHaveBeenCalledWith(mockCtx, nodes);
    });
});