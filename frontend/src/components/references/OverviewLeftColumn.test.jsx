import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OverviewLeftColumn from './OverviewLeftColumn';

describe('OverviewLeftColumn', () => {
  const defaultProps = {
    abstract: 'This is a very long abstract that should definitely exceed the line clamp limit of the container so we can see the read more button appear in the document structure safely.',
    authorKeywords: ['Australia', 'Bali', 'Dengue'],
    plusKeywords: ['METEOROLOGICAL FACTORS', 'CLIMATE'],
    researchAreas: 'Environmental Sciences & Ecology',
    wosCategories: 'Environmental Sciences',
    onExpandAbstract: vi.fn(),
    onHoverInfo: vi.fn(),
  };

  it('renders all provided props correctly', () => {
    render(<OverviewLeftColumn {...defaultProps} />);
    
    expect(screen.getByText(/This is a very long abstract/i)).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.getByText('METEOROLOGICAL FACTORS')).toBeInTheDocument();
    expect(screen.getByText('Environmental Sciences & Ecology')).toBeInTheDocument();
    expect(screen.getByText('Environmental Sciences')).toBeInTheDocument();
  });

  it('triggers onExpandAbstract when View full abstract is clicked', () => {
    render(<OverviewLeftColumn {...defaultProps} />);
    
    const expandBtn = screen.getByText(/View full abstract/i);
    fireEvent.click(expandBtn);
    
    expect(defaultProps.onExpandAbstract).toHaveBeenCalledTimes(1);
  });

  it('triggers onHoverInfo on mouse enter over info icons', () => {
    render(<OverviewLeftColumn {...defaultProps} />);
    
    const infoIcons = screen.getAllByRole('button', { name: /^info-/i });
    if (infoIcons.length > 0) {
      fireEvent.mouseEnter(infoIcons[0]);
      expect(defaultProps.onHoverInfo).toHaveBeenCalled();
    }
  });

  it('renders fallback UI for missing data', () => {
    render(
      <OverviewLeftColumn 
        onExpandAbstract={vi.fn()} 
        onHoverInfo={vi.fn()} 
      />
    );
    
    expect(screen.getByText('No abstract available.')).toBeInTheDocument();
    const fallbacks = screen.getAllByText('None provided');
    // Expected for: Author Keywords, Plus Keywords, Research Areas, WOS Categories
    expect(fallbacks.length).toBe(4);
  });
});