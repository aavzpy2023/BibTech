import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalysisView from './AnalysisView';
import useAnalysisNavigation from '../hooks/useAnalysisNavigation';

// Mock the routing state hook
vi.mock('../hooks/useAnalysisNavigation');

// Mock the static configuration to isolate test boundaries
vi.mock('../config/analysisMenuConfig', () => ({
    ANALYSIS_MENU_CONFIG: [
        {
            id: 'mock-category',
            label: 'Mock Category',
            tabs: [{ id: 'mock-tab', label: 'Mock Tab' }]
        }
    ]
}));

describe('AnalysisView Integration', () => {
    it('wires sidebar and content components together via state hook', () => {
        // Arrange
        useAnalysisNavigation.mockReturnValue({
            activeCategory: 'mock-category',
            activeTab: 'mock-tab',
            setActiveCategory: vi.fn(),
            setActiveTab: vi.fn()
        });

        // Act
        render(<AnalysisView />);
        
        // Assert
        expect(screen.getByTestId('analysis-view')).toBeInTheDocument();
        expect(screen.getByTestId('analysis-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('analysis-content')).toBeInTheDocument();
        expect(screen.getByText('Placeholder for mock-tab')).toBeInTheDocument();
    });
});