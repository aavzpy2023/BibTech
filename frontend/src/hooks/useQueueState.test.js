import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as router from 'react-router-dom';
import { useQueueState } from './useQueueState';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn()
}));

describe('useQueueState hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts DOIs into an array and initializes selectedDois as empty', () => {
    vi.mocked(router.useLocation).mockReturnValue({
      state: {
        dois: '10.1000/182\n10.1000/183',
        config: { destination: 'batch1', delay: 5, email: 'test@example.com' }
      }
    });

    const { result } = renderHook(() => useQueueState());

    expect(result.current.dois).toEqual(['10.1000/182', '10.1000/183']);
    expect(result.current.config).toEqual({
      destination: 'batch1',
      delay: 5,
      email: 'test@example.com'
    });
    expect(result.current.selectedDois).toEqual([]);
  });

  it('handles empty or missing location state gracefully', () => {
    vi.mocked(router.useLocation).mockReturnValue({});

    const { result } = renderHook(() => useQueueState());

    expect(result.current.dois).toEqual([]);
    expect(result.current.selectedDois).toEqual([]);
  });

  it('toggles DOI selection with toggleSelection', () => {
    vi.mocked(router.useLocation).mockReturnValue({
      state: {
        dois: '10.1\n10.2',
        config: { destination: 'batch1' }
      }
    });

    const { result } = renderHook(() => useQueueState());

    act(() => {
      result.current.toggleSelection('10.1');
    });
    expect(result.current.selectedDois).toEqual(['10.1']);

    act(() => {
      result.current.toggleSelection('10.1');
    });
    expect(result.current.selectedDois).toEqual([]);
  });

  it('toggles all DOIs with toggleAll', () => {
    vi.mocked(router.useLocation).mockReturnValue({
      state: {
        dois: '10.1\n10.2',
        config: { destination: 'batch1' }
      }
    });

    const { result } = renderHook(() => useQueueState());

    act(() => {
      result.current.toggleAll(['10.1', '10.2']);
    });
    expect(result.current.selectedDois).toEqual(['10.1', '10.2']);

    act(() => {
      result.current.toggleAll(['10.1', '10.2']);
    });
    expect(result.current.selectedDois).toEqual([]);
  });
});