import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHoverReveal } from './useHoverReveal';

describe('useHoverReveal', () => {
  it('should initialize with null hoverInfo', () => {
    const { result } = renderHook(() => useHoverReveal());
    expect(result.current.hoverInfo).toBeNull();
  });

  it('should set hoverInfo on mouse enter', () => {
    const { result } = renderHook(() => useHoverReveal());
    
    act(() => {
      result.current.onMouseEnter('author', 'John Doe', { 
        clientX: 100, 
        clientY: 200 
      });
    });
    
    expect(result.current.hoverInfo).toEqual({
      key: 'author',
      value: 'John Doe',
      x: 100,
      y: 200,
      isVisible: true,
    });
  });

  it('should update coordinates on mouse move if visible', () => {
    const { result } = renderHook(() => useHoverReveal());
    
    act(() => {
      result.current.onMouseEnter('author', 'John Doe', { 
        clientX: 100, 
        clientY: 200 
      });
    });
    
    act(() => {
      result.current.onMouseMove({ clientX: 150, clientY: 250 });
    });
    
    expect(result.current.hoverInfo.x).toBe(150);
    expect(result.current.hoverInfo.y).toBe(250);
  });

  it('should hide hoverInfo on mouse leave', () => {
    const { result } = renderHook(() => useHoverReveal());
    
    act(() => {
      result.current.onMouseEnter('author', 'John Doe', { 
        clientX: 100, 
        clientY: 200 
      });
    });
    
    act(() => {
      result.current.onMouseLeave();
    });
    
    expect(result.current.hoverInfo.isVisible).toBe(false);
  });
});