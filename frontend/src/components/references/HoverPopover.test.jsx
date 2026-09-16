import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HoverPopover } from './HoverPopover';

describe('HoverPopover', () => {
  it('should render null if not visible', () => {
    const { container } = render(<HoverPopover info={{ isVisible: false }} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render with correct positioning and content', () => {
    render(
      <HoverPopover
        info={{ key: 'test', value: 'data', x: 10, y: 10, isVisible: true }}
      />
    );
    const popover = screen.getByTestId('hover-popover');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveStyle({
      left: '25px',
      top: '25px',
    });
    expect(screen.getByText('data')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});