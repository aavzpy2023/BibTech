import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReferencesDataTable from './ReferencesDataTable';

describe('ReferencesDataTable', () => {
  const mockData = [
    {
      id: 1,
      title: 'Sample Epidemiology Paper',
      author: 'Doe, John',
      year: '2023',
      journal: 'The Lancet',
      doi: '10.1016/sample.2023',
      abstract: 'Sample abstract text here...',
      keywords: [{ name: 'Health', type: 'author' }],
      authors_detail: [],
    },
    {
      id: 2,
      title: 'Second Paper',
      author: 'Smith, Jane',
      year: '2022',
      journal: 'Nature',
      doi: '10.1038/sample.2022',
      abstract: 'Another abstract...',
      keywords: [],
      authors_detail: [],
    },
  ];

  it('keeps View Details disabled when 0 rows are selected', () => {
    render(<ReferencesDataTable data={mockData} />);
    const detailsBtn = screen.getByRole('button', { name: /view details/i });
    expect(detailsBtn).toBeDisabled();
  });

  it('enables View Details when 1 row is selected without opening modal', () => {
    render(<ReferencesDataTable data={mockData} />);
    const row1 = screen.getByText('Sample Epidemiology Paper').closest('tr');
    fireEvent.click(row1);

    const detailsBtn = screen.getByRole('button', { name: /view details/i });
    expect(detailsBtn).not.toBeDisabled();

    // Clicking row must not open modal
    expect(screen.queryByText('Reference Details')).not.toBeInTheDocument();

    // Clicking View Details opens modal
    fireEvent.click(detailsBtn);
    expect(screen.getByText('Reference Details')).toBeInTheDocument();
  });

  it('disables View Details when more than 1 row is selected', () => {
    render(<ReferencesDataTable data={mockData} />);
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is select-all in the header, [1] is row 1, [2] is row 2
    fireEvent.click(checkboxes[1]);
    const detailsBtn = screen.getByRole('button', { name: /view details/i });
    expect(detailsBtn).not.toBeDisabled();

    fireEvent.click(checkboxes[2]);
    expect(detailsBtn).toBeDisabled();
  });
});