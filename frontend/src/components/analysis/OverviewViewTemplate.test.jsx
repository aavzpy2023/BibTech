import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverviewViewTemplate from './OverviewViewTemplate';

describe('OverviewViewTemplate', () => {
    it('renders title, subtitle and child components correctly', () => {
        render(
            <OverviewViewTemplate
                title="General KPIs"
                subtitle="Overall performance metrics and summary indicators."
            >
                <div data-testid="test-child">Child Content</div>
            </OverviewViewTemplate>
        );

        expect(screen.getByRole('heading', { level: 2, name: 'General KPIs' }))
            .toBeInTheDocument();
        expect(
            screen.getByText(
                'Overall performance metrics and summary indicators.'
            )
        ).toBeInTheDocument();
        expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('renders title without subtitle if subtitle prop is omitted', () => {
        render(
            <OverviewViewTemplate title="Snapshot Only">
                <span>Body</span>
            </OverviewViewTemplate>
        );

        expect(
            screen.getByRole('heading', { level: 2, name: 'Snapshot Only' })
        ).toBeInTheDocument();
    });
});