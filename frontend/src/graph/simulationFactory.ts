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
    // 1. Calculate cluster centroids dynamically
    const clusterCenters = new Map<string | number, { x: number; y: number; count: number }>();
    
    // Custom force: Attracts nodes of the same cluster towards their shared geometric center
    const forceCluster = (alpha: number) => {
        clusterCenters.clear();
        
        // Accumulate positions
        for (const node of nodes) {
            const cluster = node.cluster ?? (node as any).group;
            if (cluster != null && node.x != null && node.y != null) {
                const current = clusterCenters.get(cluster) || { x: 0, y: 0, count: 0 };
                clusterCenters.set(cluster, {
                    x: current.x + node.x,
                    y: current.y + node.y,
                    count: current.count + 1
                });
            }
        }
        
        // Calculate average centroids
        for (const [key, center] of clusterCenters.entries()) {
            clusterCenters.set(key, {
                x: center.x / center.count,
                y: center.y / center.count,
                count: center.count
            });
        }
        
        // Apply gravitational pull towards cluster centroid
        for (const node of nodes) {
            const cluster = node.cluster ?? (node as any).group;
            if (cluster != null) {
                const centroid = clusterCenters.get(cluster);
                if (centroid && node.x != null && node.y != null) {
                    const k = alpha * 0.15; // Centripetal cluster strength
                    node.vx = (node.vx || 0) + (centroid.x - node.x) * k;
                    node.vy = (node.vy || 0) + (centroid.y - node.y) * k;
                }
            }
        }
    };

    return d3
        .forceSimulation<NetworkNode, NetworkLink>(nodes)
        // Reduce global repulsion to prevent the network from scattering too far
        .force("charge", d3.forceManyBody().strength(-80))
        // Increase link attraction and shorten distance
        .force(
            "link",
            d3.forceLink<NetworkNode, NetworkLink>(links)
                .id((d) => d.id)
                .distance(20)
                .strength(0.5)
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        // Prevent physical node overlap
        .force("collide", d3.forceCollide().radius((d) => ((d as NetworkNode).radius || 3) + 4).iterations(3))
        // Add manual cluster gravity
        .force("cluster", forceCluster)
        // Gentle global gravity to pull isolated components (islands) toward the center
        .force("x", d3.forceX(width / 2).strength(0.08))
        .force("y", d3.forceY(height / 2).strength(0.08));
};