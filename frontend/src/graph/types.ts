import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

/**
 * NetworkNode represents a single vertex in the D3 force simulation.
 * Extends the baseline D3 SimulationNodeDatum to inherit vx, vy, x, y, etc.
 */
export interface NetworkNode extends SimulationNodeDatum {
    id: string;
    name: string;
    radius: number;
    /**
     * The cluster assignment dictates the node's visual 3D styling mapping.
     * - "red"   -> Primary cluster
     * - "blue"  -> Secondary cluster
     * - "green" -> Tertiary cluster
     */
    cluster: "red" | "blue" | "green";
}

/**
 * NetworkLink represents an edge connecting two NetworkNodes in the simulation.
 */
export interface NetworkLink extends SimulationLinkDatum<NetworkNode> {
    source: string | NetworkNode;
    target: string | NetworkNode;
}