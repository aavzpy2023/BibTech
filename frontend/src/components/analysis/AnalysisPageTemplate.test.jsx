import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalysisPageTemplate from './AnalysisPageTemplate';

describe('AnalysisPageTemplate', () => {
    it('renders title and subtitle with standard typography', () => {
        render(
            <AnalysisPageTemplate
                title="Bibliometric Coupling"
                subtitle="Document-level network analysis."
            >
                <div data-testid="graph-slot">Graph Canvas</div>
            </AnalysisPageTemplate>
        );

        expect(
            screen.getByRole('heading', {
                level: 2,
                name: 'Bibliometric Coupling'
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Document-level network analysis.')
        ).toBeInTheDocument();
        expect(screen.getByTestId('graph-slot')).toBeInTheDocument();
    });

    it('renders toolbar and footer slots when provided', () => {
        render(
            <AnalysisPageTemplate
                title="Co-citation"
                subtitle="Journal co-citation patterns."
                toolbar={<div data-testid="toolbar-controls">Filters</div>}
                footer={<div data-testid="details-drawer">Node Details</div>}
            >
                <div>Main Chart</div>
            </AnalysisPageTemplate>
        );

        expect(screen.getByTestId('toolbar-controls')).toBeInTheDocument();
        expect(screen.getByTestId('details-drawer')).toBeInTheDocument();
    });

    it('omits toolbar and footer DOM containers when props are null', () => {
        render(
            <AnalysisPageTemplate
                title="Simple Chart"
                subtitle="No toolbar"
            >
                <div>Canvas Only</div>
            </AnalysisPageTemplate>
        );

        expect(
            screen.queryByTestId('analysis-toolbar')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('analysis-footer')
        ).not.toBeInTheDocument();
    });
});