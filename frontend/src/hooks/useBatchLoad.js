import { useState, useCallback } from 'react';

const initialInputState = {
  files: [],
  dois: ''
};

const initialConfigState = {
  delay: 5,
  sources: [],
  destination: '',
  email: ''
};

const initialMonitorState = {
  progress: 0,
  total: 0,
  logs: []
};

export function useBatchLoad() {
  const [input, setInput] = useState(initialInputState);
  const [config, setConfig] = useState(initialConfigState);
  const [monitor, setMonitor] = useState(initialMonitorState);

  const updateInput = useCallback((fieldOrUpdates, maybeValue) => {
    setInput((prev) => {
      if (typeof fieldOrUpdates === 'string') {
        return { ...prev, [fieldOrUpdates]: maybeValue };
      }
      return { ...prev, ...fieldOrUpdates };
    });
  }, []);

  const updateConfig = useCallback((fieldOrUpdates, maybeValue) => {
    setConfig((prev) => {
      if (typeof fieldOrUpdates === 'string') {
        return { ...prev, [fieldOrUpdates]: maybeValue };
      }
      return { ...prev, ...fieldOrUpdates };
    });
  }, []);

  const updateMonitor = useCallback((fieldOrUpdates, maybeValue) => {
    setMonitor((prev) => {
      if (typeof fieldOrUpdates === 'string') {
        return { ...prev, [fieldOrUpdates]: maybeValue };
      }
      return { ...prev, ...fieldOrUpdates };
    });
  }, []);

  const startBatch = useCallback(() => {
    setMonitor((prev) => ({
      ...prev,
      progress: 0,
      logs: [...prev.logs, 'Batch processing started...']
    }));
  }, []);

  return {
    input,
    config,
    monitor,
    updateInput,
    updateConfig,
    updateMonitor,
    startBatch
  };
}

export default useBatchLoad;