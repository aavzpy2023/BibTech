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
  ];

  it('renders table rows and opens ReferenceDetailsModal on View Details', () => {
    render(<ReferencesDataTable data={mockData} />);

    expect(screen.getByText('Sample Epidemiology Paper')).toBeInTheDocument();
    expect(screen.getByText('Doe, John')).toBeInTheDocument();

    const row = screen.getByText('Sample Epidemiology Paper').closest('tr');
    fireEvent.click(row);

    const detailsBtn = screen.getByRole('button', { name: /view details/i });
    expect(detailsBtn).not.toBeDisabled();
    fireEvent.click(detailsBtn);

    expect(screen.getByText('Reference Details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
  });
});