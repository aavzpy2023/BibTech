import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useReferencesTable } from './useReferencesTable';

describe('useReferencesTable', () => {
    it('paginates and filters correctly enforcing state fractality', () => {
        // Arrange
        const mockData = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            title: i === 0 ? 'Unique Test Title' : `Generic Title ${i}`,
            author: `Author ${i}`,
        }));

        // Act - Initial Render
        const { result } = renderHook(() => useReferencesTable(mockData, 13));

        // Assert - Initial Pagination State
        expect(result.current.paginatedData.length).toBe(13);
        expect(result.current.totalPages).toBe(2);
        expect(result.current.currentPage).toBe(1);

        // Act - Move to page 2
        act(() => {
            result.current.setCurrentPage(2);
        });
        
        // Assert - Page 2 boundaries
        expect(result.current.paginatedData.length).toBe(7);
        expect(result.current.currentPage).toBe(2);

        // Act - Search filter invocation
        act(() => {
            result.current.setSearchQuery('Unique');
        });

        // Assert - Filter application and page reset
        expect(result.current.paginatedData.length).toBe(1);
        expect(result.current.paginatedData[0].title).toBe('Unique Test Title');
        expect(result.current.currentPage).toBe(1);
        expect(result.current.totalPages).toBe(1);
    });
});