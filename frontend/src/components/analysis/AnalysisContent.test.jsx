import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalysisContent from './AnalysisContent';

describe('AnalysisContent', () => {
    it('renders placeholder string matching the activeTabId', () => {
        render(<AnalysisContent activeTabId="co-authorship" />);
        
        // Assert: Verify the routed string exists in the DOM
        expect(screen.getByText('Placeholder for co-authorship')).toBeInTheDocument();
    });

    it('renders correctly with empty or null activeTabId gracefully', () => {
        render(<AnalysisContent activeTabId={null} />);
        
        // Assert: Verify it handles null values gracefully via generic placeholder text
        expect(screen.getByText('Placeholder for')).toBeInTheDocument();
    });

    it('renders OverviewViewTemplate with title and subtitle for overview tabs', () => {
        render(<AnalysisContent activeTabId="general-kpis" />);
        
        expect(
            screen.getByRole('heading', { level: 2, name: 'General KPIs' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Overall performance metrics and summary indicators.'
            )
        ).toBeInTheDocument();
    });
});