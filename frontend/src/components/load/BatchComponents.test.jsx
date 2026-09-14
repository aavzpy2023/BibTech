import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BatchInput from './BatchInput';
import BatchConfig from './BatchConfig';

describe('BatchLoad Dumb Components', () => {
  describe('BatchInput', () => {
    it('renders dropzone area and textarea', () => {
      const mockOnInputUpdate = vi.fn();
      render(
        <BatchInput
          dois=""
          files={[]}
          onInputUpdate={mockOnInputUpdate}
        />
      );

      expect(screen.getByPlaceholderText(/10\./i)).toBeTruthy();
      expect(screen.getByText(/arrastra o selecciona archivos/i)).toBeTruthy();
    });

    it('triggers onInputUpdate when textarea content changes', () => {
      const mockOnInputUpdate = vi.fn();
      render(
        <BatchInput
          dois=""
          files={[]}
          onInputUpdate={mockOnInputUpdate}
        />
      );

      const textarea = screen.getByPlaceholderText(/10\./i);
      fireEvent.change(textarea, { target: { value: '10.1000/182' } });

      expect(mockOnInputUpdate).toHaveBeenCalledWith('dois', '10.1000/182');
    });
  });

  describe('BatchConfig', () => {
    it('renders slider, 5 checkboxes and 2 text inputs correctly', () => {
      const mockOnConfigUpdate = vi.fn();
      const initialConfig = {
        delay: 15,
        sources: ['Unpaywall'],
        destination: '/downloads',
        email: 'test@example.com'
      };

      render(
        <BatchConfig
          config={initialConfig}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      expect(screen.getByRole('slider')).toBeTruthy();
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(5);
      expect(screen.getByPlaceholderText(/carpeta o ruta/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/correo/i)).toBeTruthy();
    });

    it('triggers onConfigUpdate when delay slider changes', () => {
      const mockOnConfigUpdate = vi.fn();
      render(
        <BatchConfig
          delay={5}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '30' } });

      expect(mockOnConfigUpdate).toHaveBeenCalledWith('delay', 30);
    });

    it('triggers onConfigUpdate when checkbox is toggled', () => {
      const mockOnConfigUpdate = vi.fn();
      render(
        <BatchConfig
          config={{ delay: 5, sources: [], destination: '', email: '' }}
          onConfigUpdate={mockOnConfigUpdate}
        />
      );

      const unpaywallCheckbox = screen.getByLabelText(/unpaywall/i);
      fireEvent.click(unpaywallCheckbox);

      expect(mockOnConfigUpdate).toHaveBeenCalled();
    });
  });
});