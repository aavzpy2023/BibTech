import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalysisSidebar from './AnalysisSidebar';

describe('AnalysisSidebar', () => {
    const mockConfig = [
        {
            id: 'cat-1',
            label: 'Category 1',
            tabs: [
                { id: 'tab-1a', label: 'Tab 1A' },
                { id: 'tab-1b', label: 'Tab 1B' }
            ]
        },
        {
            id: 'cat-2',
            label: 'Category 2',
            tabs: [
                { id: 'tab-2a', label: 'Tab 2A' }
            ]
        }
    ];

    it('renders correctly and fires callbacks with primitive IDs', () => {
        const onSelectCategory = vi.fn();
        const onSelectTab = vi.fn();

        render(
            <AnalysisSidebar
                config={mockConfig}
                activeCategory="cat-1"
                activeTab="tab-1b"
                onSelectCategory={onSelectCategory}
                onSelectTab={onSelectTab}
            />
        );

        // Verify active sub-tabs are rendered for 'cat-1'
        expect(screen.getByText('Tab 1A')).toBeInTheDocument();
        
        // Verify inactive category 'cat-2' sub-tabs are NOT rendered
        expect(screen.queryByText('Tab 2A')).not.toBeInTheDocument();

        // Simulate click on a different category
        fireEvent.click(screen.getByText('Category 2'));
        expect(onSelectCategory).toHaveBeenCalledWith('cat-2');

        // Simulate click on a nested tab in the active category
        fireEvent.click(screen.getByText('Tab 1A'));
        expect(onSelectTab).toHaveBeenCalledWith('tab-1a');
    });
});