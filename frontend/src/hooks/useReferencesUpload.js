import { useState, useCallback } from 'react';

export function useReferencesUpload() {
  const [projectCode, setProjectCode] = useState(() => {
    try {
      return localStorage.getItem('last_project_code') || '';
    } catch {
      return '';
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [insertedCount, setInsertedCount] = useState(null);

  const uploadAndInject = useCallback(
    async (filesInput) => {
      if (!projectCode || !projectCode.trim()) {
        setError('El código de proyecto es requerido');
        setIsSuccess(false);
        return;
      }

      if (!filesInput || (Array.isArray(filesInput) && filesInput.length === 0)) {
        setError('Debe seleccionar un archivo bibliográfico válido');
        setIsSuccess(false);
        return;
      }
      
      const files = Array.isArray(filesInput) ? filesInput : [filesInput];

      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        let totalInserted = 0;
        const allParsed = [];

        for (const file of files) {
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
        totalInserted += (data.inserted ?? 0);

        try {
          const uploadForm = new FormData();
          uploadForm.append('file', file);
          const parseRes = await fetch('/api/bibliography/upload', {
            method: 'POST',
            body: uploadForm,
          });
          if (parseRes.ok) {
            const parsed = await parseRes.json();
            if (Array.isArray(parsed)) allParsed.push(...parsed);
          }
        } catch {}
        }

        try {
          localStorage.setItem('last_project_code', projectCode.trim());
        } catch {}
        setIsSuccess(true);
        setInsertedCount(totalInserted);
        return allParsed;
      } catch (err) {
        setError(err.message || 'Error inesperado durante la carga');
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    },
    [projectCode]
  );

  const resetStatus = useCallback(() => {
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    projectCode,
    setProjectCode,
    isLoading,
    isSuccess,
    error,
    insertedCount,
    uploadAndInject,
    resetStatus,
  };
}

export default useReferencesUpload;