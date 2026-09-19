import * as d3 from "d3";
import type { NetworkNode, NetworkLink } from "./types";

/**
 * Creates and configures a headless D3 Force Simulation.
 * Isolated from React lifecycle and DOM elements.
 *
 * @param nodes - Array of strict NetworkNode entities.
 * @param links - Array of strict NetworkLink entities.
 * @param width - Canvas width for center force gravity (default 800).
 * @param height - Canvas height for center force gravity (default 600).
 * @returns Configured D3 Simulation.
 */
export const createSimulation = (
    nodes: NetworkNode[],
    links: NetworkLink[],
    width: number = 800,
    height: number = 600
) => {
        return d3
            .forceSimulation<NetworkNode, NetworkLink>(nodes)
            .force("charge", d3.forceManyBody().strength(-120))
            .force(
                "link",
                d3.forceLink<NetworkNode, NetworkLink>(links).id((d) => d.id).distance(30)
            )
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d) => (d as NetworkNode).radius + 8).iterations(3))
            // Stronger centripetal gravity ensures the entire network fits inside the viewport
            .force("x", d3.forceX(width / 2).strength(0.15))
            .force("y", d3.forceY(height / 2).strength(0.15));
};