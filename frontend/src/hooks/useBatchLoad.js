import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef
} from 'react';

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

function useBatchLoadInternal() {
  const [input, setInput] = useState(initialInputState);
  const [config, setConfig] = useState(initialConfigState);
  const [monitor, setMonitor] = useState(initialMonitorState);
  const [statuses, setStatuses] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeDois, setActiveDois] = useState([]);
  const pendingQueueRef = useRef([]);
  const isDownloadingRef = useRef(false);
  const activeDoisRef = useRef([]);

  activeDoisRef.current = activeDois;
  isDownloadingRef.current = isDownloading;

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

      setActiveDois(dois);
      setIsDownloading(true);
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
    } finally {
      if (pendingQueueRef.current.length > 0) {
        const nextBatch = [...pendingQueueRef.current];
        pendingQueueRef.current = [];
        startBatch(nextBatch, activeConfig);
      } else {
        setIsDownloading(false);
      }
    }
  }, [input.dois, config.delay, config.destination, config.email]);

  const addDoisToQueue = useCallback(
    (incomingDois, overrideConfig) => {
      const list = (Array.isArray(incomingDois)
        ? incomingDois
        : String(incomingDois || '')
            .split('\n')
            .map((d) => d.trim())
            .filter(Boolean));

      const existing = new Set(activeDoisRef.current);
      const uniqueNew = list.filter((d) => !existing.has(d));

      if (uniqueNew.length === 0) return 0;

      const activeConfig = overrideConfig ?? config;

      setActiveDois((prev) => [...prev, ...uniqueNew]);
      setStatuses((prev) => {
        const next = { ...prev };
        uniqueNew.forEach((d) => {
          next[d] = 'queued';
        });
        return next;
      });
      setMonitor((prev) => ({
        ...prev,
        total: prev.total + uniqueNew.length,
        logs: [...prev.logs, `Queued ${uniqueNew.length} new DOIs`]
      }));

      if (isDownloadingRef.current) {
        pendingQueueRef.current.push(...uniqueNew);
      } else {
        startBatch(uniqueNew, activeConfig);
      }

      return uniqueNew.length;
    },
    [config, startBatch]
  );

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email);

  return {
    input,
    config,
    monitor,
    statuses,
    isDownloading,
    activeDois,
    isValidEmail,
    resetBatch,
    updateInput,
    updateConfig,
    updateMonitor,
    startBatch,
    addDoisToQueue
  };
}

const BatchContext = createContext(null);

export function BatchProvider({ children }) {
  const batchState = useBatchLoadInternal();
  return React.createElement(
    BatchContext.Provider,
    { value: batchState },
    children
  );
}

export function useBatchLoad() {
  const context = useContext(BatchContext);
  return context || useBatchLoadInternal();
}

export default useBatchLoad;