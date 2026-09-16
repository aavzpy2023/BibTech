import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReferencesDataTable } from './ReferencesDataTable';

describe('ReferencesDataTable Dumb View State Wiring', () => {
  it('renders search, paginates dynamically, and updates DOM rows', () => {
    // Arrange: Create 20 mock objects (pageSize is hardcoded to 13)
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      title: `Reference ${i + 1}`,
      author: `Author ${i + 1}`,
      year: '2026',
      journal: 'Science'
    }));

    render(<ReferencesDataTable data={mockData} />);

    // Assert 1: Initial page state shows strictly 13 data rows (+1 header)
    const initialRows = screen.getAllByRole('row');
    expect(initialRows).toHaveLength(14); // 13 + 1
    expect(screen.getByText(/Page 1 of 2/i)).toBeDefined();

    // Act: Click 'Next' to trigger state mutation via useReferencesTable
    const nextBtn = screen.getByText('Next');
    act(() => {
      nextBtn.click();
    });

    // Assert 2: Second page strictly shows 7 remaining rows (+1 header)
    const nextRows = screen.getAllByRole('row');
    expect(nextRows).toHaveLength(8); // 7 + 1
    expect(screen.getByText(/Page 2 of 2/i)).toBeDefined();
  });

  it('renders resizable column headers via useTableResize', () => {
    const mockData = [{ id: 1, title: 'T', author: 'A', year: '26', journal: 'J' }];
    const { container } = render(<ReferencesDataTable data={mockData} />);
    
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    
    expect(headers[0].style.width).toBe('45%');
    expect(headers[1].style.width).toBe('20%');
    expect(headers[2].style.width).toBe('10%');
    expect(headers[3].style.width).toBe('25%');

    const resizeHandlers = container.querySelectorAll('div[style*="col-resize"]');
    expect(resizeHandlers).toHaveLength(4);
  });
});