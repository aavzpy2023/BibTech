export const exportCanvasToImage = (canvasRef, filename = 'network-export.png') => {
    try {
        const fgEl = canvasRef.current;
        // react-force-graph exposes its internal canvas via the canvas property on the ref
        const fgCanvas = fgEl ? fgEl.canvas || document.querySelector('canvas') : null;
        if (!fgCanvas) return;

        const scale = 2.5;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = fgCanvas.width * scale;
        exportCanvas.height = fgCanvas.height * scale;
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) return;

        // Apply white background safely
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw original canvas
        ctx.drawImage(fgCanvas, 0, 0, exportCanvas.width, exportCanvas.height);

        // Execute download
        const a = document.createElement('a');
        a.href = exportCanvas.toDataURL('image/png');
        a.download = filename;
        a.click();
    } catch (err) {
        console.error('HD Export Error:', err);
    }
};