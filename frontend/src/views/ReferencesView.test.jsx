import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ReferencesView } from './ReferencesView';

vi.mock('../hooks/useReferencesUpload', () => ({
  useReferencesUpload: () => ({
    projectCode: '',
    setProjectCode: vi.fn(),
    isLoading: false,
    isSuccess: false,
    error: null,
    insertedCount: 0,
    uploadAndInject: vi.fn(),
    resetStatus: vi.fn(),
  }),
}));

describe('ReferencesView UI Translation', () => {
  it('should render English text in ReferencesView', () => {
    render(<ReferencesView />);
    
    expect(screen.getByText('Bibliographic References')).toBeDefined();
    expect(
      screen.getByText(/View and manage persisted publications/i)
    ).toBeDefined();
    expect(screen.getByText('+ Upload References')).toBeDefined();
    expect(screen.getByText('No references available to display.')).toBeDefined();
  });

  it('should render English text in UploadReferencesModal', () => {
    render(<ReferencesView />);
    fireEvent.click(screen.getByText('+ Upload References'));
    
    expect(screen.getByText('New References Ingestion')).toBeDefined();
    expect(
      screen.getByText(/Enter the project code and select \.ris/i)
    ).toBeDefined();
    expect(screen.getByText('Project Code or Name *')).toBeDefined();
    expect(
      screen.getByText(/Provide a project name to enable the uploader/i)
    ).toBeDefined();
    expect(screen.getByText('Cancel')).toBeDefined();
  });
});