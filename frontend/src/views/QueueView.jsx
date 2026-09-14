import React, { useState, useEffect } from 'react';
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
  secondaryButton: {
    backgroundColor: '#fff',
    color: '#24292e',
    border: '1px solid #d1d5da',
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
  filterBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '12px',
    marginBottom: '8px'
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#24292e',
    cursor: 'pointer'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  statusQueued: {
    backgroundColor: '#f1f8ff',
    color: '#0366d6'
  },
  statusResolving: {
    backgroundColor: '#fffbdd',
    color: '#735c0f'
  },
  statusDownloaded: {
    backgroundColor: '#dcffe4',
    color: '#1a7f37'
  },
  statusNotFound: {
    backgroundColor: '#f6f8fa',
    color: '#57606a'
  },
  statusFailed: {
    backgroundColor: '#ffebe9',
    color: '#cf222e'
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
  progressTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e1e4e8',
    borderRadius: '5px',
    overflow: 'hidden',
    marginTop: '8px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0366d6',
    transition: 'width 0.3s ease'
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
    downloadZip,
    downloadMissingDois
  } = useQueueState();
  const {
    monitor,
    statuses = {},
    startBatch,
    isDownloading
  } = useBatchLoad();

  useEffect(() => {
    if (
      !isDownloading &&
      (monitor?.progress ?? 0) === 0 &&
      dois &&
      dois.length > 0
    ) {
      startBatch(dois, config);
    }
  }, [dois, config, startBatch, isDownloading, monitor?.progress]);

  const downloadedDois = (dois || []).filter(
    (doi) => statuses[doi] === 'downloaded'
  );
  const canDownload = selectedDois.length > 0 || downloadedDois.length > 0;

  useEffect(() => {
    if (downloadedDois.length > 0) {
      downloadedDois.forEach((doi) => {
        if (!selectedDois.includes(doi)) {
          toggleSelection(doi);
        }
      });
    }
  }, [statuses, dois, selectedDois, toggleSelection]);

  const missingDois = (dois || []).filter(
    (doi) => statuses[doi] === 'not_found' || statuses[doi] === 'failed'
  );
  const hasMissing = missingDois.length > 0;

  const handleDownload = () => {
    const target =
      selectedDois.length > 0 ? selectedDois : downloadedDois;
    downloadZip(target);
  };

  const handleDownloadMissing = () => {
    downloadMissingDois(missingDois, config.destination);
  };

  const renderStatus = (statusKey) => {
    switch (statusKey) {
      case 'downloaded':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusDownloaded }}>
            ✓ Downloaded
          </span>
        );
      case 'resolving':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusResolving }}>
            ⏳ Resolving...
          </span>
        );
      case 'not_found':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusNotFound }}>
            ⊘ PDF Not Available
          </span>
        );
      case 'failed':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusNotFound }}>
            ⊘ PDF Not Available
          </span>
        );
      default:
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusQueued }}>
            Queued
          </span>
        );
    }
  };

  const [showOnlyDownloaded, setShowOnlyDownloaded] = useState(false);

  const displayedDois = showOnlyDownloaded
    ? (dois || []).filter((doi) => statuses[doi] === 'downloaded')
    : (dois || []);

  const selectableDois = displayedDois.filter(
    (doi) => statuses[doi] !== 'not_found' && statuses[doi] !== 'failed'
  );

  const allSelected =
    selectableDois.length > 0 &&
    selectableDois.every((doi) => selectedDois.includes(doi));

  return (
    <div style={styles.container} data-testid="queue-view">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Download Queue</h2>
          <p style={styles.subtitle}>
          Batch: {config.destination || 'Default'} | Progress: {monitor?.progress ?? 0}/{monitor?.total || dois.length}
        </p>
        <div style={styles.progressTrack}>
          <div
            data-testid="queue-progress-bar-fill"
            style={{
              ...styles.progressFill,
              width: `${
                (monitor?.total || dois.length) > 0
                  ? Math.min(
                      100,
                      Math.round(
                        ((monitor?.progress ?? 0) /
                          (monitor?.total || dois.length)) *
                          100
                      )
                    )
                  : 0
              }%`
            }}
          />
        </div>
      </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <label style={styles.filterLabel}>
            <input
              type="checkbox"
              checked={showOnlyDownloaded}
              onChange={(e) => setShowOnlyDownloaded(e.target.checked)}
            />
            <span>Only PDFs</span>
          </label>
          <button
            type="button"
            disabled={!hasMissing}
            style={{
              ...styles.secondaryButton,
              ...(!hasMissing ? styles.disabledButton : {})
            }}
            onClick={handleDownloadMissing}
          >
            Export Missing DOIs (.txt)
          </button>
          <button
            type="button"
            disabled={!canDownload}
            style={{
            ...styles.downloadButton,
            ...(!canDownload ? styles.disabledButton : {})
          }}
          onClick={handleDownload}
        >
          Download PDFs
        </button>
        </div>
      </div>




      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                aria-label="Select all"
                checked={allSelected}
                disabled={selectableDois.length === 0}
                onChange={() => toggleAll(selectableDois)}
              />
            </th>
            <th style={styles.th}>DOI</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedDois.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ ...styles.td, textAlign: 'center' }}>
                {showOnlyDownloaded
                  ? 'No downloaded PDFs found.'
                  : 'No DOIs in queue.'}
              </td>
            </tr>
          ) : (
            displayedDois.map((doi) => {
              const isUnavailable =
                statuses[doi] === 'not_found' || statuses[doi] === 'failed';
              const isSelected = !isUnavailable && selectedDois.includes(doi);
              return (
                <tr key={doi} style={styles.row}>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${doi}`}
                      checked={isSelected}
                      disabled={isUnavailable}
                      style={{
                        cursor: isUnavailable ? 'not-allowed' : 'pointer'
                      }}
                      onChange={() => {
                        if (!isUnavailable) {
                          toggleSelection(doi);
                        }
                      }}
                    />
                  </td>
                  <td style={styles.td}>{doi}</td>
                  <td style={styles.td}>
                    {renderStatus(statuses[doi] || 'queued')}
                  </td>
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