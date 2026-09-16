import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReferenceHeroBlock from './ReferenceHeroBlock';

describe('ReferenceHeroBlock', () => {
  const defaultProps = {
    title: 'Test Article Title',
    authors: 'John Doe, Jane Smith',
    year: '2024',
    journal: 'Test Journal',
    volume: '10',
    issue: '2',
    pages: '100-110',
    doi: '10.1000/182',
    onCopyDoi: vi.fn(),
  };

  it('renders all provided props correctly', () => {
    render(<ReferenceHeroBlock {...defaultProps} />);
    
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Test Journal')).toBeInTheDocument();
    expect(screen.getByText('Vol. 10')).toBeInTheDocument();
    expect(screen.getByText('Issue 2')).toBeInTheDocument();
    expect(screen.getByText('pp. 100-110')).toBeInTheDocument();
    expect(screen.getByText('10.1000/182')).toBeInTheDocument();
  });

  it('renders dashes for missing optional metrics', () => {
    const incompleteProps = {
      ...defaultProps,
      volume: null,
      issue: null,
      pages: null,
      doi: null
    };
    render(<ReferenceHeroBlock {...incompleteProps} />);
    
    // There should be 4 '—' placeholders (Vol, Issue, Pages, DOI)
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(4);
  });

  it('triggers onCopyDoi when DOI button is clicked', () => {
    render(<ReferenceHeroBlock {...defaultProps} />);
    
    // Find the nearest button wrapping the DOI text
    const doiButton = screen.getByRole('button', { name: /10\.1000\/182/i });
    fireEvent.click(doiButton);
    
    expect(defaultProps.onCopyDoi).toHaveBeenCalledWith('10.1000/182');
  });
});