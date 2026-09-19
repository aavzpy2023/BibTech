import React, { useEffect } from "react";
import { createSimulation } from "../simulationFactory";
import { executeRenderFrame } from "../render/renderLoop";
import type { NetworkNode, NetworkLink } from "../types";

/**
 * Orchestrates the D3 Force simulation lifecycle and bridges it to the Canvas context.
 * Enforces State Fractality: React manages mount/unmount, D3 manages mathematical ticks.
 */
export const useForceSimulation = (
    data: { nodes: NetworkNode[]; links: NetworkLink[] },
    canvasRef: React.RefObject<HTMLCanvasElement>
) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Initialize pure mathematical simulation
        const simulation = createSimulation(data.nodes, data.links, width, height);

        // Bind rendering orchestrator to physics ticks
        simulation.on("tick", () => {
            executeRenderFrame(ctx, width, height, data.nodes, data.links);
        });

        // Cleanup: Stop physics calculations on component unmount
        return () => {
            simulation.stop();
        };
    }, [data, canvasRef]);
};