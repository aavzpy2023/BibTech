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

  it('triggers downloadZip with selected DOIs and cleans up object URL', async () => {
    const originalFetch = global.fetch;
    const mockBlob = new Blob(['dummy zip'], { type: 'application/zip' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob)
    });

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:dummy-url');
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    vi.mocked(router.useLocation).mockReturnValue({
      state: {
        dois: '10.1\n10.2',
        config: { destination: 'my-batch' }
      }
    });

    const { result } = renderHook(() => useQueueState());

    act(() => {
      result.current.toggleSelection('10.1');
    });

    await act(async () => {
      await result.current.downloadZip();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bibliography/download-zip',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_name: 'my-batch',
          dois: ['10.1']
        })
      })
    );

    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:dummy-url');

    global.fetch = originalFetch;
  });

  it('allows downloadZip with override DOIs even when selectedDois is empty', async () => {
    const originalFetch = global.fetch;
    const mockBlob = new Blob(['zip data'], { type: 'application/zip' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob)
    });

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
    window.URL.revokeObjectURL = vi.fn();

    vi.mocked(router.useLocation).mockReturnValue({
      state: {
        dois: '10.1\n10.2',
        config: { destination: 'batch-test' }
      }
    });

    const { result } = renderHook(() => useQueueState());

    await act(async () => {
      await result.current.downloadZip(['10.1']);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bibliography/download-zip',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          batch_name: 'batch-test',
          dois: ['10.1']
        })
      })
    );

    global.fetch = originalFetch;
  });

  it('triggers downloadMissingDois creating a txt file blob', () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:txt-url');
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    vi.mocked(router.useLocation).mockReturnValue({
      state: { config: { destination: 'mine' } }
    });

    const { result } = renderHook(() => useQueueState());

    act(() => {
      result.current.downloadMissingDois(['10.1029/2024GH001325'], 'mine');
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:txt-url');
  });
});