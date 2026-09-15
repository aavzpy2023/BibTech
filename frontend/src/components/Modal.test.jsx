import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Reusable Modal Component', () => {
  it('renders correctly when open and handles close event', () => {
    const handleClose = vi.fn();
    
    // Arrange: Render the modal
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Generic Modal"
        description="This is a standardized description."
      >
        <div data-testid="child-content">Child Content</div>
      </Modal>
    );

    // Assert: Elements are present
    expect(screen.getByText('Generic Modal')).toBeDefined();
    expect(screen.getByText('This is a standardized description.')).toBeDefined();
    expect(screen.getByTestId('child-content')).toBeDefined();

    // Act: Click close button
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);

    // Assert: onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Hidden">
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByText('Hidden')).toBeNull();
  });
});