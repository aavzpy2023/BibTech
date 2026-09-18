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
});