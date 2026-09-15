import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadReferencesModal from './UploadReferencesModal';

describe('UploadReferencesModal Dark Mode Compliance', () => {
  it('renders with dark mode background and light text colors', () => {
    // Arrange: Render the modal as open
    render(
      <UploadReferencesModal
        isOpen={true}
        onClose={vi.fn()}
        projectCode=""
        setProjectCode={vi.fn()}
        uploadAndInject={vi.fn()}
      />
    );

    // Act: Query the modal container and specific text nodes
    const modalContainer = screen.getByTestId('upload-modal-container');
    const title = screen.getByText('New References Ingestion');

    // Assert: Verify background matches #161b22 (jsdom converts hex to rgb in styles)
    // #161b22 = rgb(22, 27, 34)
    expect(modalContainer.style.backgroundColor).toBe('rgb(22, 27, 34)');
    
    // Assert: Verify text colors avoid dark hex and match #f0f6fc
    // #f0f6fc = rgb(240, 246, 252)
    expect(title.style.color).toBe('rgb(240, 246, 252)');
  });
});