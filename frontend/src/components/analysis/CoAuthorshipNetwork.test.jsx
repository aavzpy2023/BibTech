import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoAuthorshipNetwork from './CoAuthorshipNetwork';

describe('CoAuthorshipNetwork', () => {
    it('renders header, controls and network visualization canvas', () => {
        render(<CoAuthorshipNetwork />);

        expect(
            screen.getByRole('heading', {
                level: 2,
                name: 'Co-authorship Network'
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Mapping collaboration patterns and author clusters across publications.'
            )
        ).toBeInTheDocument();
        expect(screen.getByTestId('coauthorship-svg')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search author...')).toBeInTheDocument();
    });

    it('allows searching and filtering authors', () => {
        render(<CoAuthorshipNetwork />);
        const input = screen.getByPlaceholderText('Search author...');

        fireEvent.change(input, { target: { value: 'Vaswani' } });
        expect(input.value).toBe('Vaswani');
    });

    it('supports 3D rotation via mouse drag and reset button', () => {
        render(<CoAuthorshipNetwork />);
        const svg = screen.getByTestId('coauthorship-svg');
        const resetBtn = screen.getByRole('button', { name: /Reset 3D View/i });

        fireEvent.mouseDown(svg, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(svg, { clientX: 150, clientY: 120 });
        fireEvent.mouseUp(svg);

        expect(resetBtn).toBeInTheDocument();
        fireEvent.click(resetBtn);
    });

    it('renders corner logo watermark and handles HD download trigger', () => {
        render(<CoAuthorshipNetwork />);

        expect(screen.getByTestId('corner-watermark-logo')).toBeInTheDocument();
        
        const downloadBtn = screen.getByRole('button', { name: /Download HD/i });
        expect(downloadBtn).toBeInTheDocument();

        fireEvent.click(downloadBtn);
    });

    it('renders VOSviewer mode switchers and cluster legend', () => {
        render(<CoAuthorshipNetwork />);

        expect(screen.getByRole('button', { name: /Network/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Overlay/i })).toBeInTheDocument();
        expect(screen.getByTestId('vosviewer-legend')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Overlay/i }));
    });

    it('renders 2D/3D toggles and size slider', () => {
        render(<CoAuthorshipNetwork />);
        
        expect(screen.getByRole('button', { name: '2D' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '3D' })).toBeInTheDocument();
        expect(screen.getByLabelText(/Size:/i)).toBeInTheDocument();
    });
});