import { describe, it, expect } from "vitest";
import { createSimulation } from "./simulationFactory";
import { NetworkNode, NetworkLink } from "./types";

describe("simulationFactory", () => {
    it("initializes a d3 simulation with nodes, links, and active forces", () => {
        // 1. Arrange: Create mock nodes and links adhering to strict semantics
        const nodes: NetworkNode[] = [
            { id: "1", name: "Alpha Node", radius: 10, cluster: "red" },
            { id: "2", name: "Beta Node", radius: 10, cluster: "blue" },
        ];
        
        const links: NetworkLink[] = [
            { source: "1", target: "2" },
        ];

        // 2. Act: Invoke the factory
        const simulation = createSimulation(nodes, links);

        // 3. Assert: Verify object existence and force attachment
        expect(simulation).toBeDefined();
        expect(simulation.nodes().length).toBe(2);

        // Act: Advance the simulation to trigger velocity calculations
        simulation.tick();

        // Assert: In-place mutations by the D3 engine must populate vx and vy
        expect(nodes[0].vx).toBeDefined();
        expect(nodes[0].vy).toBeDefined();
        expect(nodes[1].vx).toBeDefined();
        expect(nodes[1].vy).toBeDefined();
    });
});