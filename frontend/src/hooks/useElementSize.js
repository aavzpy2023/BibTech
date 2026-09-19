import { useLayoutEffect, useState } from 'react';

/**
 * Mide un elemento y se actualiza cuando cambia de tamaño.
 * useLayoutEffect: la primera medida existe antes del primer pintado.
 * Devuelve { width: 0, height: 0 } hasta medir (o en jsdom, donde no hay layout).
 */
export default function useElementSize(ref) {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;

        const measure = () => {
            const width = Math.round(el.clientWidth);
            const height = Math.round(el.clientHeight);
            setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
        };

        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);

    return size;
}
