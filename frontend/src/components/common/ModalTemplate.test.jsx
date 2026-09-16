import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModalTemplate from './ModalTemplate';

describe('ModalTemplate', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ModalTemplate isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </ModalTemplate>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders content when isOpen is true and triggers onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <ModalTemplate isOpen={true} onClose={mockOnClose} header="Test Header">
        <div>Modal Content</div>
      </ModalTemplate>
    );

    // Verify modal content and header are present
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Test Header')).toBeInTheDocument();

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Verify onClose was called exactly once
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});