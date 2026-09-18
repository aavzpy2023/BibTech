import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useAnalysisNavigation from './useAnalysisNavigation';

// Mock the configuration to maintain testing boundaries
vi.mock('../config/analysisMenuConfig', () => ({
    ANALYSIS_MENU_CONFIG: [
        {
            id: 'category-a',
            label: 'Cat A',
            tabs: [{ id: 'tab-a1', label: 'Tab A1' }, { id: 'tab-a2', label: 'Tab A2' }]
        },
        {
            id: 'network-analysis',
            label: 'Network',
            tabs: [{ id: 'co-authorship', label: 'Co Authorship' }]
        }
    ]
}));

describe('useAnalysisNavigation', () => {
    it('initializes with the first category and its first tab', () => {
        const { result } = renderHook(() => useAnalysisNavigation());
        
        expect(result.current.activeCategory).toBe('category-a');
        expect(result.current.activeTab).toBe('tab-a1');
    });

    it('resets to the first child tab when category changes', () => {
        const { result } = renderHook(() => useAnalysisNavigation());
        
        act(() => {
            result.current.setActiveCategory('network-analysis');
        });
        
        expect(result.current.activeCategory).toBe('network-analysis');
        expect(result.current.activeTab).toBe('co-authorship');
    });

    it('allows changing active tab independently of category', () => {
        const { result } = renderHook(() => useAnalysisNavigation());
        
        act(() => {
            result.current.setActiveTab('tab-a2');
        });
        
        expect(result.current.activeCategory).toBe('category-a');
        expect(result.current.activeTab).toBe('tab-a2');
    });
});