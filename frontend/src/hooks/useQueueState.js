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

  return {
    dois,
    config,
    selectedDois,
    toggleSelection,
    toggleAll
  };
}

export default useQueueState;