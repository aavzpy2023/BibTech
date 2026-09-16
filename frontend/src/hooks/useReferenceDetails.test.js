import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useReferenceDetails from './useReferenceDetails';

describe('useReferenceDetails', () => {
  const mockArticle = {
    id: 1,
    title: 'Test Article Title',
    author: 'Doe, John and Smith, Jane',
    year: '2024',
    journal: 'Nature Test',
    doi: '10.1000/182',
    abstract: 'Sample abstract text for test.',
    keywords: [
      { name: 'Dengue', type: 'author' },
      { name: 'Climate', type: 'plus' },
    ],
    authors_detail: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        orcid: '0000-0001',
        is_corresponding: true,
        affiliation: 'University of Test',
      },
      {
        name: 'Jane Smith',
        email: null,
        orcid: null,
        is_corresponding: false,
        affiliation: 'Test Institute',
      },
    ],
    funding_list: [{ id: 1, agency: 'NIH', grant_number: 'R01' }],
    funding_text: 'Funded by NIH grant R01.',
    publisher: 'Nature Publishing',
    language: 'English',
    oa_status: 'Gold',
    times_cited: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state values', () => {
    const { result } = renderHook(() => useReferenceDetails(mockArticle));

    expect(result.current.activeTab).toBe('Overview');
    expect(result.current.drawerState.isOpen).toBe(false);
    expect(result.current.hoverInfo).toBeNull();
  });

  it('updates activeTab when handleTabChange or setActiveTab is called', () => {
    const { result } = renderHook(() => useReferenceDetails(mockArticle));

    act(() => {
      result.current.setActiveTab('Metadata');
    });

    expect(result.current.activeTab).toBe('Metadata');

    act(() => {
      result.current.handleTabChange('Authors & Institutions');
    });

    expect(result.current.activeTab).toBe('Authors & Institutions');
  });

  it('opens and closes the drawer with corresponding payload', () => {
    const { result } = renderHook(() => useReferenceDetails(mockArticle));
    const customData = [{ name: 'Test Author' }];

    act(() => {
      result.current.openDrawer('authors', customData, 'Authors Details');
    });

    expect(result.current.drawerState.isOpen).toBe(true);
    expect(result.current.drawerState.type).toBe('authors');
    expect(result.current.drawerState.data).toEqual(customData);
    expect(result.current.drawerState.title).toBe('Authors Details');

    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.drawerState.isOpen).toBe(false);
  });

  it('extracts and formats primitive props from the article object', () => {
    const { result } = renderHook(() => useReferenceDetails(mockArticle));

    expect(result.current.title).toBe('Test Article Title');
    expect(result.current.authorKeywords).toEqual(['Dengue']);
    expect(result.current.plusKeywords).toEqual(['Climate']);
    expect(result.current.authorsDetailsCount).toBe(2);
    expect(result.current.authorEmail).toBe('john@example.com');
    expect(result.current.orcidCount).toBe(1);
    expect(result.current.affiliations).toContain('University of Test');
  });

  it('handles copy action gracefully', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useReferenceDetails(mockArticle));

    await act(async () => {
      await result.current.handleCopy('10.1000/182');
    });

    expect(writeTextMock).toHaveBeenCalledWith('10.1000/182');
    expect(result.current.copiedText).toBe('10.1000/182');
  });
});