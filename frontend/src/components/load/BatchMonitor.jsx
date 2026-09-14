import React from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e4e8',
    borderRadius: '8px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    padding: '10px 24px',
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  progressText: {
    fontSize: '13px',
    color: '#586069',
    display: 'flex',
    justifyContent: 'space-between'
  },
  track: {
    width: '100%',
    height: '16px',
    backgroundColor: '#e1e4e8',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: '#0366d6',
    transition: 'width 0.3s ease'
  },
  logsContainer: {
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '12px',
    borderRadius: '6px',
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
};

export function BatchMonitor({
  progress = 0,
  total = 0,
  logs = [],
  monitor,
  onStart
}) {
  const currentProgress = monitor?.progress ?? progress;
  const currentTotal = monitor?.total ?? total;
  const currentLogs = monitor?.logs ?? logs;

  const percentage =
    currentTotal > 0
      ? Math.min(100, Math.round((currentProgress / currentTotal) * 100))
      : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#24292e' }}>
          Load and Download Monitor
        </h3>
        <button
          type="button"
          style={styles.button}
          onClick={onStart}
        >
          Start Download
        </button>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressText}>
          <span>Retrieval progress</span>
          <span>
            {currentProgress} / {currentTotal} ({percentage}%)
          </span>
        </div>
        <div style={styles.track}>
          <div
            data-testid="progress-bar-fill"
            style={{
              ...styles.fill,
              width: `${percentage}%`
            }}
          />
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            marginBottom: '6px'
          }}
        >
          Event logs
        </div>
        <div style={styles.logsContainer}>
          {currentLogs.length === 0 ? (
            <span style={{ color: '#8b949e' }}>No recent activity.</span>
          ) : (
            currentLogs.map((log, index) => (
              <div key={`${index}-${log.slice(0, 10)}`}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BatchMonitor;