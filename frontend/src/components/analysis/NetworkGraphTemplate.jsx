import React, { forwardRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { drawNode, drawLink, drawAllLabels } from '../../views/analysis/network/networkRender';
import { calculateRadius } from '../../views/analysis/network/networkStyles';

/**
 * Dumb View: Pure Canvas renderer for topological networks.
 * Physics engine is forcibly disabled (cooldownTicks={0}).
 *
 * width/height NO tienen valor por defecto: los pasa el contenedor con su tamaño
 * real. (Con 800x600 por defecto el canvas quedaba fijo en la esquina superior
 * izquierda y el grafo se ajustaba a esa zona.) Sin valores, la librería usa el
 * tamaño de la ventana.
 */
const NetworkGraphTemplate = forwardRef(({
    frozenData,
    width,
    height,
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
            nodeCanvasObjectMode={() => 'replace'}
            nodeCanvasObject={(node, ctx, globalScale) => {
                drawNode(node, ctx, globalScale);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, calculateRadius(node), 0, 2 * Math.PI, false);
                ctx.fill();
            }}
            linkCanvasObjectMode={() => 'replace'}
            linkCanvasObject={(link, ctx, globalScale) => {
                drawLink(link, ctx, globalScale);
            }}
            // Etiquetas en una sola pasada, después de nodos y aristas (ningún nodo las tapa).
            // La marca de agua ya no se dibuja aquí: es el logo HTML del contenedor.
            onRenderFramePost={(ctx, globalScale) => {
                drawAllLabels(frozenData.nodes, ctx, globalScale);
            }}
            onNodeClick={onNodeClick}
        />
    );
});

NetworkGraphTemplate.displayName = 'NetworkGraphTemplate';
export default NetworkGraphTemplate;
