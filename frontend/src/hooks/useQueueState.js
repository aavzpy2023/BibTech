import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBatchLoad } from './useBatchLoad';

export function useQueueState() {
  const location = useLocation();
  const { input, config: batchConfig, activeDois, statuses } =
    useBatchLoad();

  const rawDois =
    (activeDois && activeDois.length > 0 ? activeDois : null) ||
    location.state?.dois ||
    input?.dois ||
    Object.keys(statuses || {});

  const config =
    location.state?.config ||
    batchConfig ||
    {};

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

  const downloadZip = useCallback(
    async (overrideDois) => {
      const targetDois =
        overrideDois && overrideDois.length > 0
          ? overrideDois
          : selectedDois;

      if (targetDois.length === 0) return;

      const batchName = config.destination || 'download_batch';
    try {
      const response = await fetch('/api/bibliography/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_name: batchName,
          dois: targetDois
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
  },
  [config.destination, selectedDois]
  );

  const downloadMissingDois = useCallback(
    (missingList, batchNameOverride) => {
      if (!missingList || missingList.length === 0) return;

      const batchName =
        batchNameOverride || config.destination || 'batch';
      const blob = new Blob([missingList.join('\n')], {
        type: 'text/plain;charset=utf-8'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${batchName}_missing_dois.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    [config.destination]
  );

  return {
    dois,
    config,
    selectedDois,
    toggleSelection,
    toggleAll,
    downloadZip,
    downloadMissingDois
  };
}

export default useQueueState;