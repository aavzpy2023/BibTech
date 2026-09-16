import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MetadataGrid } from './MetadataGrid';

describe('MetadataGrid', () => {
  it('should render grid items and handle hover events', () => {
    const onHover = vi.fn();
    const onMove = vi.fn();
    const onLeave = vi.fn();
    
    const data = { author: 'John Doe', year: 2023 };
    
    render(
      <MetadataGrid 
        data={data} 
        onHover={onHover} 
        onMove={onMove} 
        onLeave={onLeave} 
      />
    );
    
    const authorBox = screen.getByText('John Doe').parentElement;
    
    fireEvent.mouseEnter(authorBox, { clientX: 100, clientY: 200 });
    expect(onHover).toHaveBeenCalledWith('author', 'John Doe', expect.any(Object));
    
    fireEvent.mouseMove(authorBox, { clientX: 110, clientY: 210 });
    expect(onMove).toHaveBeenCalled();
    
    fireEvent.mouseLeave(authorBox);
    expect(onLeave).toHaveBeenCalled();
  });
});