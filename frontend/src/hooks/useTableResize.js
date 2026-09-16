import { useState, useEffect, useCallback } from 'react';

export function useTableResize() {
  const [colWidths, setColWidths] = useState({
    title: 45,
    author: 20,
    year: 10,
    journal: 25,
  });

  const [isResizing, setIsResizing] = useState(null);

  const handleMouseDown = useCallback((e, colName) => {
    // Prevenimos la selección de texto u otros comportamientos default al arrastrar
    if (e.preventDefault) e.preventDefault();
    
    setIsResizing({
      colName,
      startX: e.clientX,
      startWidth: colWidths[colName],
    });
  }, [colWidths]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const { colName, startX, startWidth } = isResizing;
    const deltaX = e.clientX - startX;
    
    // Calculamos el desplazamiento como porcentaje del ancho de la ventana
    const containerWidth = window.innerWidth;
    const deltaPct = (deltaX / containerWidth) * 100;
    
    let newWidth = startWidth + deltaPct;
    
    // Constraint mínimo absoluto de 5%
    if (newWidth < 5) newWidth = 5;

    setColWidths((prev) => ({
      ...prev,
      [colName]: newWidth,
    }));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    colWidths,
    handleMouseDown,
  };
}

export default useTableResize;