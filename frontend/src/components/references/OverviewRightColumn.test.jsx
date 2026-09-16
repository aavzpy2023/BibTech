import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OverviewRightColumn from './OverviewRightColumn';
import MetricsFooterCards from './MetricsFooterCards';

describe('OverviewRightColumn', () => {
  const defaultProps = {
    affiliations: 'Queensland University',
    authorsDetailsCount: 10,
    authorEmail: 'test@example.com',
    orcidCount: 8,
    researcherIdCount: 10,
    fundingText: 'Funded by multiple sources',
    onHoverInfo: vi.fn(),
    onCopy: vi.fn(),
    onExpandDrawer: vi.fn(),
  };

  it('renders all right column props correctly', () => {
    render(<OverviewRightColumn {...defaultProps} />);
    
    expect(screen.getByText('Queensland University')).toBeInTheDocument();
    expect(screen.getByText('10 authors (see full list)')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('8 ORCID IDs')).toBeInTheDocument();
    expect(screen.getByText('10 Researcher IDs')).toBeInTheDocument();
    expect(screen.getByText('Funded by multiple sources')).toBeInTheDocument();
  });

  it('triggers onCopy when email copy button is clicked', () => {
    render(<OverviewRightColumn {...defaultProps} />);
    
    const copyBtn = screen.getByRole('button', { name: /copy email/i });
    fireEvent.click(copyBtn);
    
    expect(defaultProps.onCopy).toHaveBeenCalledWith('test@example.com');
  });

  it('triggers onExpandDrawer when authors details is clicked', () => {
    render(<OverviewRightColumn {...defaultProps} />);
    
    const authorsBtn = screen.getByRole('button', { name: /open authors list/i });
    fireEvent.click(authorsBtn);
    
    expect(defaultProps.onExpandDrawer).toHaveBeenCalledWith('authors');
  });
});

describe('MetricsFooterCards', () => {
  const footerProps = {
    type: 'Article',
    language: 'English',
    issn: '1234-5678',
    month: 'AUG',
    articleNumber: '213-220',
    pages: '213-220',
    publisher: 'NATURE',
    address: 'LONDON',
    timesCited: 22,
    oaStatus: 'Gold',
    onHoverInfo: vi.fn(),
  };

  it('renders footer metrics correctly', () => {
    render(<MetricsFooterCards {...footerProps} />);
    
    expect(screen.getByText('Bibliographic Information')).toBeInTheDocument();
    expect(screen.getByText('Article')).toBeInTheDocument();
    expect(screen.getByText('1234-5678')).toBeInTheDocument();
    expect(screen.getByText('NATURE')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('renders specific OA badge styling for Gold', () => {
    render(<MetricsFooterCards {...footerProps} />);
    
    const badge = screen.getByText('Gold');
    expect(badge).toHaveClass('bg-green-900/30', 'text-green-400');
  });
});