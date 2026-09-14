import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueueView } from './QueueView';
import * as queueHook from '../hooks/useQueueState';
import * as batchHook from '../hooks/useBatchLoad';

vi.mock('../hooks/useQueueState');
vi.mock('../hooks/useBatchLoad');

describe('QueueView component', () => {
  const mockToggleSelection = vi.fn();
  const mockToggleAll = vi.fn();
  const mockStartBatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(queueHook, 'useQueueState').mockReturnValue({
      dois: ['10.1000/182', '10.1000/183'],
      config: { destination: 'my-batch', delay: 5, email: 'test@example.com' },
      selectedDois: ['10.1000/182'],
      toggleSelection: mockToggleSelection,
      toggleAll: mockToggleAll
    });

    vi.spyOn(batchHook, 'useBatchLoad').mockReturnValue({
      input: { dois: '10.1000/182\n10.1000/183', files: [] },
      config: { destination: 'my-batch', delay: 5, email: 'test@example.com' },
      monitor: { progress: 1, total: 2, logs: ['Downloaded 10.1000/182'] },
      updateInput: vi.fn(),
      updateConfig: vi.fn(),
      updateMonitor: vi.fn(),
      startBatch: mockStartBatch
    });
  });

  it('renders queue title, table rows and checkboxes correctly', () => {
    render(<QueueView />);

    expect(screen.getByText('Download Queue')).toBeInTheDocument();
    expect(screen.getByText('10.1000/182')).toBeInTheDocument();
    expect(screen.getByText('10.1000/183')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('calls toggleSelection when a row checkbox is clicked', () => {
    render(<QueueView />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[2]);

    expect(mockToggleSelection).toHaveBeenCalledWith('10.1000/183');
  });

  it('calls toggleAll when the select-all checkbox is clicked', () => {
    render(<QueueView />);

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(mockToggleAll).toHaveBeenCalledWith(['10.1000/182', '10.1000/183']);
  });

  it('triggers startBatch on mount', () => {
    render(<QueueView />);
    expect(mockStartBatch).toHaveBeenCalled();
  });
});