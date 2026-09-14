import React, { useEffect } from 'react';
import useQueueState from '../hooks/useQueueState';
import useBatchLoad from '../hooks/useBatchLoad';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px 0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e1e4e8',
    paddingBottom: '16px'
  },
  downloadButton: {
    backgroundColor: '#2ea44f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#94d3a2',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#24292e',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#586069',
    marginTop: '4px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
    border: '1px solid #e1e4e8',
    borderRadius: '6px'
  },
  th: {
    backgroundColor: '#f6f8fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #e1e4e8',
    fontSize: '14px',
    fontWeight: '600',
    color: '#24292e'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e1e4e8',
    fontSize: '14px',
    color: '#24292e'
  },
  row: {
    backgroundColor: '#fff'
  }
};

export function QueueView() {
  const {
    dois,
    config,
    selectedDois,
    toggleSelection,
    toggleAll,
    downloadZip
  } = useQueueState();
  const { startBatch } = useBatchLoad();

  useEffect(() => {
    startBatch(dois, config);
  }, []);

  const allSelected =
    dois.length > 0 && selectedDois.length === dois.length;

  return (
    <div style={styles.container} data-testid="queue-view">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Download Queue</h2>
          <p style={styles.subtitle}>
            Batch: {config.destination || 'Default'} | Total DOIs: {dois.length}
          </p>
        </div>
        <button
          type="button"
          disabled={selectedDois.length === 0}
          style={{
            ...styles.downloadButton,
            ...(selectedDois.length === 0 ? styles.disabledButton : {})
          }}
          onClick={downloadZip}
        >
          Download PDFs
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                aria-label="Select all"
                checked={allSelected}
                onChange={() => toggleAll(dois)}
              />
            </th>
            <th style={styles.th}>DOI</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {dois.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ ...styles.td, textAlign: 'center' }}>
                No DOIs in queue.
              </td>
            </tr>
          ) : (
            dois.map((doi) => {
              const isSelected = selectedDois.includes(doi);
              return (
                <tr key={doi} style={styles.row}>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${doi}`}
                      checked={isSelected}
                      onChange={() => toggleSelection(doi)}
                    />
                  </td>
                  <td style={styles.td}>{doi}</td>
                  <td style={styles.td}>Queued</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default QueueView;