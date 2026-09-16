import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReferenceDrawer from './ReferenceDrawer';

describe('ReferenceDrawer', () => {
  const mockItems = [
    { id: '1', title: 'Paper 1', doi: '10.1000/1', year: 2020 },
    { id: '2', title: 'Paper 2', doi: '10.1000/2', year: 2021 },
    { id: '3', title: 'Paper 3', doi: '10.1000/3', year: 2022 },
    { id: '4', title: 'Paper 4', doi: '10.1000/4', year: 2023 },
    { id: '5', title: 'Paper 5', doi: '10.1000/5', year: 2024 },
  ];

  it('renders 5 items and triggers onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <ReferenceDrawer
        isOpen={true}
        onClose={mockOnClose}
        title="References"
        type="references"
        data={mockItems}
      />
    );

    expect(screen.getByText('References')).toBeInTheDocument();
    const items = screen.getAllByTestId('drawer-item');
    expect(items.length).toBe(5);

    const closeBtn = screen.getByRole('button', { name: /close drawer/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders authors accurately when type is authors', () => {
    const mockAuthors = [
      {
        id: 'a1',
        name: 'Alice Smith',
        affiliation: 'MIT',
        is_corresponding: true,
      },
    ];
    render(
      <ReferenceDrawer
        isOpen={true}
        onClose={vi.fn()}
        title="Authors Details"
        type="authors"
        data={mockAuthors}
      />
    );

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Corresponding')).toBeInTheDocument();
  });

  it('applies translate-x-full when isOpen is false', () => {
    const { container } = render(
      <ReferenceDrawer
        isOpen={false}
        onClose={vi.fn()}
        title="References"
        data={[]}
      />
    );

    const drawer = container.firstChild;
    expect(drawer).toHaveClass('translate-x-full');
  });
});