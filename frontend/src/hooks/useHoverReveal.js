import { useState, useCallback } from 'react';

export function useHoverReveal() {
  const [hoverInfo, setHoverInfo] = useState(null);

  const onMouseEnter = useCallback((key, value, e) => {
    setHoverInfo({
      key,
      value,
      x: e.clientX,
      y: e.clientY,
      isVisible: true,
    });
  }, []);

  const onMouseMove = useCallback((e) => {
    setHoverInfo((prev) =>
      prev?.isVisible ? { ...prev, x: e.clientX, y: e.clientY } : prev
    );
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoverInfo((prev) => (prev ? { ...prev, isVisible: false } : null));
  }, []);

  return { hoverInfo, onMouseEnter, onMouseMove, onMouseLeave };
}