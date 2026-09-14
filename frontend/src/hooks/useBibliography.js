import { useState, useCallback } from 'react';

export function useBibliography() {
  const [references, setReferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/bibliography/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error uploading file');
      }

      setReferences(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    references,
    isLoading,
    error,
    uploadFile
  };
}

export default useBibliography;