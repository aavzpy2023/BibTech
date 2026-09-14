import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BatchMonitor from './BatchMonitor';

describe('BatchMonitor component', () => {
  it('renders progress bar width and log text correctly', () => {
    const mockOnStart = vi.fn();
    const logs = ['Log 1: Initializing download', 'Log 2: In progress'];

    render(
      <BatchMonitor
        progress={45}
        total={344}
        logs={logs}
        onStart={mockOnStart}
      />
    );

    expect(screen.getByText('Log 1: Initializing download')).toBeTruthy();
    expect(screen.getByText('Log 2: In progress')).toBeTruthy();
    expect(screen.getByText(/45 \/ 344/)).toBeTruthy();

    const progressBar = screen.getByTestId('progress-bar-fill');
    expect(progressBar.style.width).toContain('%');
  });

  it('triggers onStart when Start Download button is clicked', () => {
    const mockOnStart = vi.fn();
    render(
      <BatchMonitor
        progress={0}
        total={10}
        logs={[]}
        onStart={mockOnStart}
      />
    );

    const startButton = screen.getByRole('button', {
      name: /iniciar descarga/i
    });
    fireEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });
});