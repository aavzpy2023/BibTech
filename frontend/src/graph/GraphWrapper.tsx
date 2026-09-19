import React from "react";
import { GraphCanvas } from "./GraphCanvas";

/**
 * Boundary Layer UI that wraps the dumb canvas.
 * Provides a relative positioning context for absolute overlays
 * like the branding watermark, ensuring zero interference with the D3 physics engine.
 */
export const GraphWrapper: React.FC = () => {
    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <GraphCanvas />
            
            {/* Branding Overlay */}
            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    pointerEvents: "none", // Prevent capturing canvas drag events
                    fontFamily: "sans-serif",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "rgba(15, 23, 42, 0.4)", // Dark slate semi-transparent
                    letterSpacing: "0.15em",
                    userSelect: "none"
                }}
            >
                NOVASCOPE
            </div>
        </div>
    );
};