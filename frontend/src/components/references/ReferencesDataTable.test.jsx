import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
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

  it('selects a row on click and opens details modal with complete metadata', () => {
    const mockData = [
      {
        id: 101,
        title: 'Quantum Computing Deep Dive',
        author: 'Alice Smith and Bob Jones',
        year: '2025',
        journal: 'Nature Physics',
        volume: '42',
        pages: '100-110',
        publisher: 'Nature Publishing',
        abstract: 'An in-depth study of quantum coherence.',
        doi: '10.1038/s41567-025-001',
      },
    ];

    render(<ReferencesDataTable data={mockData} />);

    const detailsBtn = screen.getByRole('button', { name: /view details/i });
    expect(detailsBtn.disabled).toBe(true);

    const rowCell = screen.getByText('Quantum Computing Deep Dive');
    fireEvent.click(rowCell);

    expect(detailsBtn.disabled).toBe(false);

    fireEvent.click(detailsBtn);

    expect(screen.getByText('Reference Details')).toBeDefined();
    expect(screen.getByText('Alice Smith and Bob Jones')).toBeDefined();
    expect(screen.getByText('Nature Physics')).toBeDefined();
    expect(screen.getByText('An in-depth study of quantum coherence.')).toBeDefined();

    const doiLink = screen.getByRole('link', {
      name: /10.1038\/s41567-025-001/i,
    });
    expect(doiLink).toBeDefined();
    expect(doiLink.getAttribute('href')).toBe(
      'https://doi.org/10.1038/s41567-025-001'
    );
    expect(doiLink.getAttribute('target')).toBe('_blank');
    expect(doiLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});