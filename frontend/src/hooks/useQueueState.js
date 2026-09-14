import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export function useQueueState() {
  const location = useLocation();
  const rawDois = location.state?.dois ?? '';
  const config = location.state?.config ?? {};

  const dois = useMemo(() => {
    if (Array.isArray(rawDois)) {
      return rawDois;
    }
    if (typeof rawDois === 'string') {
      return rawDois
        .split('\n')
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
    }
    return [];
  }, [rawDois]);

  const [selectedDois, setSelectedDois] = useState([]);

  const toggleSelection = useCallback((doi) => {
    setSelectedDois((prev) =>
      prev.includes(doi) ? prev.filter((d) => d !== doi) : [...prev, doi]
    );
  }, []);

  const toggleAll = useCallback(
    (allDois) => {
      const targetList = allDois ?? dois;
      setSelectedDois((prev) =>
        prev.length === targetList.length ? [] : [...targetList]
      );
    },
    [dois]
  );

  const downloadZip = useCallback(async () => {
    if (selectedDois.length === 0) return;

    const batchName = config.destination || 'download_batch';
    try {
      const response = await fetch('/api/bibliography/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_name: batchName,
          dois: selectedDois
        })
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${batchName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download ZIP archive', err);
    }
  }, [config.destination, selectedDois]);

  return {
    dois,
    config,
    selectedDois,
    toggleSelection,
    toggleAll,
    downloadZip
  };
}

export default useQueueState;