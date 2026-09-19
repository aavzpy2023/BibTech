import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoAuthorshipNetwork from './CoAuthorshipNetwork';

// Hexagonal Mock for react-force-graph-2d to ensure zero-IO JSDOM execution
vi.mock('react-force-graph-2d', () => ({
    default: (props) => (
        <div data-testid="coauthorship-force-graph">
            <canvas data-testid="mock-fg-canvas" />
        </div>
    )
}));

describe('CoAuthorshipNetwork with react-force-graph', () => {
    it('renders header, controls and force-graph canvas container', () => {
        render(<CoAuthorshipNetwork />);

        expect(
            screen.getByRole('heading', {
                level: 2,
                name: 'Co-authorship Network'
            })
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('coauthorship-force-graph')
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Search author...')
        ).toBeInTheDocument();
        expect(screen.getByTestId('corner-watermark-logo')).toBeInTheDocument();
    });

    it('supports mode toggling and node size slider interactions', () => {
        render(<CoAuthorshipNetwork />);

        const overlayBtn = screen.getByRole('button', { name: /Overlay/i });
        fireEvent.click(overlayBtn);

        const sizeSlider = screen.getByLabelText(/Size:/i);
        fireEvent.change(sizeSlider, { target: { value: '1.8' } });
        expect(sizeSlider.value).toBe('1.8');
    });

    it('triggers HD download button safely', () => {
        render(<CoAuthorshipNetwork />);

        const downloadBtn = screen.getByRole('button', { name: /Download HD/i });
        expect(downloadBtn).toBeInTheDocument();
        fireEvent.click(downloadBtn);
    });
});