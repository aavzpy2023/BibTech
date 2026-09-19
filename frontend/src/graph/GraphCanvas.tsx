import React, { useRef } from "react";
import { useForceSimulation } from "./hooks/useForceSimulation";
import { dummyNodes, dummyLinks } from "./dummyData";

/**
 * 100% Dumb View component.
 * Responsible ONLY for providing the DOM node reference.
 * Zero logic allowed inside the JSX.
 */
export const GraphCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State Fractality: Delegate all lifecycle and D3 execution to the custom hook
    useForceSimulation({ nodes: dummyNodes, links: dummyLinks }, canvasRef);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ 
                border: "1px solid #e2e8f0", 
                backgroundColor: "#ffffff",
                borderRadius: "8px"
            }}
        />
    );
};