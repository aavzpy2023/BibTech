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
            .force("charge", d3.forceManyBody().strength(-600))
            .force(
                "link",
                d3.forceLink<NetworkNode, NetworkLink>(links).id((d) => d.id).distance(120)
            )
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d) => (d as NetworkNode).radius + 15).iterations(2));
};