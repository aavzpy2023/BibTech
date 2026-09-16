import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReferencesUpload } from './useReferencesUpload';

describe('useReferencesUpload', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should initialize projectCode from localStorage if present', () => {
    localStorage.setItem('last_project_code', 'DEFAULT-PROJ');
    const { result } = renderHook(() => useReferencesUpload());
    expect(result.current.projectCode).toBe('DEFAULT-PROJ');
  });

  it('should upload and inject multiple files sequentially (FIFO)', async () => {
    const mockFile = new File(['fake bib content'], 'test1.bib', {
      type: 'text/plain',
    });
    const mockFile2 = new File(['fake bib'], 'test2.bib', { type: 'text/plain' });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Success', inserted: 5 }),
    });

    const { result } = renderHook(() => useReferencesUpload());

    act(() => {
      result.current.setProjectCode('TEST');
    });

    await act(async () => {
      await result.current.uploadAndInject([mockFile, mockFile2]);
    });

    expect(global.fetch).toHaveBeenCalledTimes(4); // 2 files * 2 requests
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/api/bibliography/inject');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('file')).toBe(mockFile);
    expect(options.body.get('project_code')).toBe('TEST');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.insertedCount).toBe(10); // 2 files * 5
    expect(localStorage.getItem('last_project_code')).toBe('TEST');
  });

  it('should abort and set error if project code is missing', async () => {
    const mockFile = new File(['content'], 'test.bib', {
      type: 'text/plain',
    });
    global.fetch = vi.fn();

    const { result } = renderHook(() => useReferencesUpload());

    await act(async () => {
      await result.current.uploadAndInject(mockFile);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(
      'El código de proyecto es requerido'
    );
  });

  it('should abort and set error if file is missing', async () => {
    global.fetch = vi.fn();

    const { result } = renderHook(() => useReferencesUpload());

    act(() => {
      result.current.setProjectCode('TEST');
    });

    await act(async () => {
      await result.current.uploadAndInject(null);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(
      'Debe seleccionar un archivo bibliográfico válido'
    );
  });

  it('should handle frontend validation error for non .bib files', async () => {
    const mockFile = new File(['content'], 'test.ris');
    global.fetch = vi.fn();
    
    const { result } = renderHook(() => useReferencesUpload());
    act(() => { result.current.setProjectCode('TEST'); });
    
    await act(async () => { await result.current.uploadAndInject(mockFile); });
    
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe('Solo se permiten archivos .bib');
  });

  it('should handle API error gracefully', async () => {
    const mockFile = new File(['bad content'], 'test.bib', {
      type: 'text/plain',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Error de conexión a la base de datos' }),
    });

    const { result } = renderHook(() => useReferencesUpload());

    act(() => {
      result.current.setProjectCode('TEST');
    });

    await act(async () => {
      await result.current.uploadAndInject(mockFile);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Error de conexión a la base de datos');
  });

  it('should upload and track both parsedCount and insertedCount', async () => {
    const mockFile = new File(['fake bib'], 'test1.bib', { type: 'text/plain' });

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/inject')) {
        return Promise.resolve({ ok: true, json: async () => ({ inserted: 2 }) });
      }
      if (url.includes('/upload')) {
        return Promise.resolve({ ok: true, json: async () => ([1, 2, 3, 4, 5]) });
      }
      return Promise.reject(new Error('not mocked'));
    });

    const { result } = renderHook(() => useReferencesUpload());
    act(() => { result.current.setProjectCode('TEST'); });

    await act(async () => {
      await result.current.uploadAndInject([mockFile]);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.insertedCount).toBe(2);
    expect(result.current.parsedCount).toBe(5);
  });
});