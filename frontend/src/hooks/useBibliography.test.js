import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBibliography } from './useBibliography';

// Mock global fetch
global.fetch = vi.fn();

describe('useBibliography hook', () => {
  it('initializes with default states', () => {
    const { result } = renderHook(() => useBibliography());
    expect(result.current.references).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles successful file upload', async () => {
    const mockRefs = [{ title: 'Test Paper', author: 'John Doe' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRefs
    });

    const { result } = renderHook(() => useBibliography());
    const file = new File(['dummy content'], 'test.ris', { type: 'text/plain' });

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.references).toEqual(mockRefs);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bibliography/upload',
      expect.any(Object)
    );
  });

  it('handles upload error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Unsupported file extension' })
    });

    const { result } = renderHook(() => useBibliography());
    const file = new File(['dummy'], 'test.txt');

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Unsupported file extension');
    expect(result.current.references).toEqual([]);
  });
});