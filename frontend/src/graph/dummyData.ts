import type { NetworkNode, NetworkLink } from "./types";

/**
 * Static development data simulating a semantic bibliography network.
 * Satisfies the strict NetworkNode and NetworkLink interfaces.
 */
export const dummyNodes: NetworkNode[] = [
    { id: "1", name: "Core Model", radius: 15, cluster: "red" },
    { id: "2", name: "Analytics Service", radius: 10, cluster: "blue" },
    { id: "3", name: "Data Warehouse", radius: 10, cluster: "blue" },
    { id: "4", name: "Event Bus", radius: 8, cluster: "green" },
    { id: "5", name: "Ingestion API", radius: 12, cluster: "red" },
];

export const dummyLinks: NetworkLink[] = [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
    { source: "2", target: "4" },
    { source: "3", target: "4" },
    { source: "5", target: "1" },
];