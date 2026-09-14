import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBatchLoad } from './useBatchLoad';

describe('useBatchLoad hook', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('initializes with default states', () => {
    const { result } = renderHook(() => useBatchLoad());
    expect(result.current.input.dois).toBe('');
    expect(result.current.config.delay).toBe(5);
    expect(result.current.monitor.progress).toBe(0);
    expect(result.current.monitor.logs).toEqual([]);
  });

  it('updates input and config correctly', () => {
    const { result } = renderHook(() => useBatchLoad());

    act(() => {
      result.current.updateInput('dois', '10.1000/182\n10.1000/183');
      result.current.updateConfig('destination', '/downloads');
      result.current.updateConfig('email', 'author@uni.edu');
    });

    expect(result.current.input.dois).toBe('10.1000/182\n10.1000/183');
    expect(result.current.config.destination).toBe('/downloads');
    expect(result.current.config.email).toBe('author@uni.edu');
  });

  it('streams batch download updates via startBatch', async () => {
    const eventPayload =
      'data: {"progress": 1, "total": 1, "log": "test"}\n\n';
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(eventPayload));
        controller.close();
      }
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    });

    const { result } = renderHook(() => useBatchLoad());

    act(() => {
      result.current.updateInput('dois', '10.1000/182');
      result.current.updateConfig('destination', '/downloads');
      result.current.updateConfig('email', 'author@uni.edu');
    });

    await act(async () => {
      await result.current.startBatch();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bibliography/batch-download',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dois: ['10.1000/182'],
          delay: 5,
          destination: '/downloads',
          email: 'author@uni.edu'
        })
      })
    );

    expect(result.current.monitor.progress).toBe(1);
    expect(result.current.monitor.logs).toContain('test');
  });

  it('handles fetch failure gracefully in startBatch', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBatchLoad());

    act(() => {
      result.current.updateInput('dois', '10.1000/182');
    });

    await act(async () => {
      await result.current.startBatch();
    });

    expect(result.current.monitor.logs).toContain('Error: Network error');
  });

  it('validates email format correctly via isValidEmail', () => {
    const { result } = renderHook(() => useBatchLoad());

    expect(result.current.isValidEmail).toBe(false);

    act(() => {
      result.current.updateConfig('email', 'invalid-email');
    });
    expect(result.current.isValidEmail).toBe(false);

    act(() => {
      result.current.updateConfig('email', 'author@domain.com');
    });
    expect(result.current.isValidEmail).toBe(true);
  });

  it('updates per-DOI statuses during startBatch with overrides', async () => {
    const payload =
      'data: {"progress": 1, "total": 1, "doi": "10.1/test", "status": "downloaded"}\n\n';
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      }
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    });

    const { result } = renderHook(() => useBatchLoad());

    await act(async () => {
      await result.current.startBatch(['10.1/test'], {
        destination: '/custom',
        email: 'a@b.com'
      });
    });

    expect(result.current.statuses['10.1/test']).toBe('downloaded');
  });

  it('resets all fields back to initial state via resetBatch', () => {
    const { result } = renderHook(() => useBatchLoad());

    act(() => {
      result.current.updateInput('dois', '10.1/test');
      result.current.updateConfig('destination', '/custom');
      result.current.updateConfig('email', 'author@test.com');
    });

    expect(result.current.input.dois).toBe('10.1/test');

    act(() => {
      result.current.resetBatch();
    });

    expect(result.current.input.dois).toBe('');
    expect(result.current.config.destination).toBe('');
    expect(result.current.config.email).toBe('');
  });

  it('sets isDownloading to true during batch download and false when done', async () => {
    const payload = 'data: {"progress": 1, "total": 1}\n\n';
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      }
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: stream
    });

    const { result } = renderHook(() => useBatchLoad());

    expect(result.current.isDownloading).toBe(false);

    let startPromise;
    act(() => {
      startPromise = result.current.startBatch(['10.1/test']);
    });

    expect(result.current.isDownloading).toBe(true);

    await act(async () => {
      await startPromise;
    });

    expect(result.current.isDownloading).toBe(false);
  });
});