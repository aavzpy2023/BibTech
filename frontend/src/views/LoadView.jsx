import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBatchLoad from '../hooks/useBatchLoad';
import BatchInput from '../components/load/BatchInput';
import BatchConfig from '../components/load/BatchConfig';
import BatchMonitor from '../components/load/BatchMonitor';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e4e8',
    borderRadius: '8px'
  },
  header: {
    borderBottom: '1px solid #e1e4e8',
    paddingBottom: '16px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  newBatchBtn: {
    backgroundColor: '#fff',
    border: '1px solid #d1d5da',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#24292e',
    cursor: 'pointer'
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
  const navigate = useNavigate();
  const {
    input,
    config,
    monitor,
    updateInput,
    updateConfig,
    isValidEmail,
    isDownloading,
    resetBatch,
    startBatch,
    addDoisToQueue
  } = useBatchLoad();

  const isValid =
    input.dois.trim() !== '' &&
    config.destination.trim() !== '' &&
    isValidEmail;
    config.email.trim() !== '';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Batch Bibliography Load</h2>
            <p style={styles.subtitle}>
          Enter bibliographic files or DOI identifiers for automatic download.
            </p>
          </div>
          <button
            type="button"
            style={styles.newBatchBtn}
            onClick={resetBatch}
          >
            New batch
          </button>
        </div>
      </div>

      <BatchInput
        files={input.files}
        dois={input.dois}
        onInputUpdate={updateInput}
      />

      <BatchConfig
        delay={config.delay}
        destination={config.destination}
        email={config.email}
        onConfigUpdate={updateConfig}
      />

      <BatchMonitor
        progress={monitor.progress}
        total={monitor.total}
        logs={monitor.logs}
        disabled={!isValid}
        isDownloading={isDownloading}
        onStart={() => {
          if (isDownloading && addDoisToQueue) {
            addDoisToQueue(input.dois, config);
          } else {
            startBatch();
          }
          navigate('/queue', { state: { dois: input.dois, config } });
        }}
      />
    </div>
  );
}

export default LoadView;