import React, { useRef } from "react";
import { useForceSimulation } from "./hooks/useForceSimulation";
import { dummyNodes, dummyLinks } from "./dummyData";

/**
 * 100% Dumb View component.
 * Responsible ONLY for providing the DOM node reference.
 * Zero logic allowed inside the JSX.
 */
export const GraphCanvas: React.FC = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [dim, setDim] = React.useState({ w: 800, h: 600 });

    // Responsive Listener: Binds canvas resolution strictly to its parent container
    React.useEffect(() => {
        if (!containerRef.current) return;
        const obs = new ResizeObserver((entries) => {
            setDim({ w: entries[0].contentRect.width, h: entries[0].contentRect.height });
        });
        obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    // State Fractality: Pass dynamic dimensions to the physics orchestrator
    useForceSimulation({ nodes: dummyNodes, links: dummyLinks }, canvasRef, dim);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            <canvas ref={canvasRef} width={dim.w} height={dim.h} style={{ display: "block" }} />
        </div>
    );
};