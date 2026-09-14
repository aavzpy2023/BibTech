import React from 'react';
import useBatchLoad from '../hooks/useBatchLoad';
import BatchInput from '../components/load/BatchInput';
import BatchConfig from '../components/load/BatchConfig';
import BatchMonitor from '../components/load/BatchMonitor';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  header: {
    borderBottom: '1px solid #e1e4e8',
    paddingBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#24292e',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#586069',
    margin: 0
  }
};

export function LoadView() {
  const {
    input,
    config,
    monitor,
    updateInput,
    updateConfig,
    startBatch
  } = useBatchLoad();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Batch Bibliography Load</h2>
        <p style={styles.subtitle}>
          Enter bibliographic files or DOI identifiers for automatic download.
        </p>
      </div>

      <BatchInput
        files={input.files}
        dois={input.dois}
        onInputUpdate={updateInput}
      />

      <BatchConfig
        delay={config.delay}
        sources={config.sources}
        destination={config.destination}
        email={config.email}
        onConfigUpdate={updateConfig}
      />

      <BatchMonitor
        progress={monitor.progress}
        total={monitor.total}
        logs={monitor.logs}
        onStart={startBatch}
      />
    </div>
  );
}

export default LoadView;