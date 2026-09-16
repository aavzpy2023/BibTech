import { renderHook, act } from '@testing-library/react';
import { useTableResize } from './useTableResize';

describe('useTableResize', () => {
  beforeEach(() => {
    // Definimos el innerWidth del window a 1000px para que el cálculo
    // del porcentaje de desplazamiento (deltaPct) sea predecible: 
    // 10px de movimiento = 1%
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  it('initializes with default column widths', () => {
    const { result } = renderHook(() => useTableResize());
    
    expect(result.current.colWidths).toEqual({
      title: 40,
      author: 20,
      year: 15,
      journal: 25,
    });
  });

  it('updates width on mouse move when resizing is active', () => {
    const { result } = renderHook(() => useTableResize());

    act(() => {
      // Simulamos mousedown en la columna 'title'
      result.current.handleMouseDown({ clientX: 100, preventDefault: vi.fn() }, 'title');
    });

    act(() => {
      // Simulamos movimiento de 100px a la derecha (equivalente a 10%)
      // title: 40 + 10 = 50%
      const moveEvent = new MouseEvent('mousemove', { clientX: 200 });
      window.dispatchEvent(moveEvent);
    });

    expect(result.current.colWidths.title).toBe(50);

    act(() => {
      // Finalizamos el arrastre
      const upEvent = new MouseEvent('mouseup');
      window.dispatchEvent(upEvent);
    });
  });

  it('respects minimum width constraints of 5%', () => {
    const { result } = renderHook(() => useTableResize());

    act(() => {
      result.current.handleMouseDown({ clientX: 500, preventDefault: vi.fn() }, 'year');
    });

    act(() => {
      // Movimiento extremo a la izquierda de 400px = -40%
      // year inicial es 15%. 15 - 40 = -25%, debe limitarse a 5%
      const moveEvent = new MouseEvent('mousemove', { clientX: 100 });
      window.dispatchEvent(moveEvent);
    });

    expect(result.current.colWidths.year).toBe(5);

    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });
  });
});