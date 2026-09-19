import React, { useEffect } from "react";
import * as d3 from "d3";
import { createSimulation } from "../simulationFactory";
import { executeRenderFrame } from "../render/renderLoop";
import type { NetworkNode, NetworkLink } from "../types";

/**
 * Orchestrates the D3 Force simulation lifecycle and bridges it to the Canvas context.
 * Enforces State Fractality: React manages mount/unmount, D3 manages mathematical ticks.
 */
export const useForceSimulation = (
    data: { nodes: NetworkNode[]; links: NetworkLink[] },
    canvasRef: React.RefObject<HTMLCanvasElement>,
    dim: { w: number, h: number }
) => {
    const simRef = React.useRef<d3.Simulation<NetworkNode, NetworkLink>>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Initialize pure mathematical simulation
        const simulation = createSimulation(data.nodes, data.links, dim.w, dim.h);
        simRef.current = simulation;

        // Bind rendering orchestrator to physics ticks
        simulation.on("tick", () => {
            executeRenderFrame(ctx, canvas.width, canvas.height, data.nodes, data.links);
        });

        // Cleanup: Stop physics calculations on component unmount
        return () => {
            simulation.stop();
        };
    }, [data, canvasRef]); // Core physics mount isolation

    // Responsive Physics Engine Updates
    useEffect(() => {
        if (simRef.current) {
            simRef.current.force("center", d3.forceCenter(dim.w / 2, dim.h / 2));
            simRef.current.force("x", d3.forceX(dim.w / 2).strength(0.05));
            simRef.current.force("y", d3.forceY(dim.h / 2).strength(0.05));
            simRef.current.alpha(0.3).restart(); // Gentle wake-up to adjust to new bounds
        }
    }, [dim]);
};