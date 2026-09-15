import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { DashboardView } from './App';

vi.mock('./hooks/useBibliography', () => ({
  useBibliography: () => ({
    references: [],
    isLoading: false,
    error: null,
    uploadFile: vi.fn()
  })
}));

describe('DashboardView UI Standardization', () => {
  it('should apply standardized padding and typography styles', () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "OK",
        database: "Postgres",
        proxy: "Nginx",
        framework: "FastAPI"
      })
    });

    const { getByRole, container } = render(<DashboardView />);
    
    const dashboardContainer = container.firstChild;
    expect(dashboardContainer).toHaveStyle({
      padding: '0',
      textAlign: 'center'
    });
    
    const title = getByRole('heading', { level: 1 });
    expect(title).toHaveStyle({
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#24292e',
      margin: '0 0 8px 0'
    });
  });
});