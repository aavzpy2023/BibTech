import { useState, useCallback } from 'react';

export function useReferencesUpload() {
  const [projectCode, setProjectCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [insertedCount, setInsertedCount] = useState(null);

  const uploadAndInject = useCallback(
    async (file) => {
      if (!projectCode || !projectCode.trim()) {
        setError('El código de proyecto es requerido');
        setIsSuccess(false);
        return;
      }

      if (!file) {
        setError('Debe seleccionar un archivo bibliográfico válido');
        setIsSuccess(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_code', projectCode.trim());

        const response = await fetch('/api/bibliography/inject', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errPayload = await response.json().catch(() => ({}));
          throw new Error(
            errPayload.detail || 'Error al inyectar referencias'
          );
        }

        const data = await response.json();
        setIsSuccess(true);
        setInsertedCount(data.inserted ?? 0);
      } catch (err) {
        setError(err.message || 'Error inesperado durante la carga');
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    },
    [projectCode]
  );

  return {
    projectCode,
    setProjectCode,
    isLoading,
    isSuccess,
    error,
    insertedCount,
    uploadAndInject,
  };
}

export default useReferencesUpload;