import { useState, useCallback } from 'react';

const initialInputState = {
  files: [],
  dois: ''
};

const initialConfigState = {
  delay: 5,
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
  const [statuses, setStatuses] = useState({});

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

  const resetBatch = useCallback(() => {
    setInput(initialInputState);
    setConfig(initialConfigState);
    setMonitor(initialMonitorState);
    setStatuses({});
  }, []);

  const startBatch = useCallback(
    async (overrideDois, overrideConfig) => {
      const rawDois = overrideDois ?? input.dois;
      const dois = Array.isArray(rawDois)
        ? rawDois
        : rawDois
            .split('\n')
            .map((d) => d.trim())
            .filter((d) => d.length > 0);

      const activeConfig = overrideConfig ?? config;

      const initialStatuses = {};
      dois.forEach((d) => {
        initialStatuses[d] = 'queued';
      });
      setStatuses(initialStatuses);

    setMonitor({
      progress: 0,
      total: dois.length,
      logs: ['Starting batch download...']
    });

    try {
      const response = await fetch('/api/bibliography/batch-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dois,
          delay: Number(activeConfig.delay ?? 5),
          destination: activeConfig.destination ?? '',
          email: activeConfig.email ?? ''
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim();
            try {
              const eventData = JSON.parse(jsonStr);
              if (eventData.doi && eventData.status) {
                setStatuses((prev) => ({
                  ...prev,
                  [eventData.doi]: eventData.status
                }));
              }
              setMonitor((prev) => ({
                progress: eventData.progress ?? prev.progress,
                total: eventData.total ?? prev.total,
                logs: eventData.log
                  ? [...prev.logs, eventData.log]
                  : prev.logs
              }));
            } catch {
              // Ignore non-JSON or partial chunk
            }
          }
        }
      }
    } catch (err) {
      setMonitor((prev) => ({
        ...prev,
        logs: [...prev.logs, `Error: ${err.message}`]
      }));
    }
  }, [input.dois, config.delay, config.destination, config.email]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email);

  return {
    input,
    config,
    monitor,
    statuses,
    isValidEmail,
    resetBatch,
    updateInput,
    updateConfig,
    updateMonitor,
    startBatch
  };
}

export default useBatchLoad;