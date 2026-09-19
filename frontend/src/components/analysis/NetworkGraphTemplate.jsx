import React, { forwardRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { 
    drawNode, 
    drawLink, 
    drawLabel, 
    drawBranding 
} from '../../views/analysis/network/networkRender';

/**
 * Dumb View: Pure Canvas renderer for topological networks.
 * Physics engine is forcibly disabled (cooldownTicks={0}).
 */
const NetworkGraphTemplate = forwardRef(({ 
    frozenData, 
    width = 800, 
    height = 600, 
    onNodeClick 
}, ref) => {
    
    if (!frozenData || !frozenData.nodes) {
        return null;
    }

    return (
        <ForceGraph2D
            ref={ref}
            width={width}
            height={height}
            graphData={frozenData}
            cooldownTicks={0} // FATAL RULE: Disables real-time D3 ticking (Graph is frozen)
            enableNodeDrag={false} // Dragging disabled due to static physics layout
            nodeCanvasObject={(node, ctx, globalScale) => {
                drawNode(node, ctx, globalScale);
                drawLabel(node, ctx, globalScale);
            }}
            linkCanvasObject={(link, ctx, globalScale) => {
                drawLink(link, ctx, globalScale);
            }}
            onRenderFramePost={(ctx) => {
                drawBranding(ctx, width, height);
            }}
            onNodeClick={onNodeClick}
        />
    );
});

NetworkGraphTemplate.displayName = 'NetworkGraphTemplate';
export default NetworkGraphTemplate;