import React from 'react';

const styles = {
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '14px',
  },
  auditItemBox: {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '12px',
    cursor: 'crosshair',
  },
  modalLabel: {
    fontSize: '12px',
    color: '#8b949e',
    fontWeight: '500',
    marginBottom: '4px',
  },
  modalValue: {
    fontSize: '13px',
    color: '#c9d1d9',
    lineHeight: '1.4',
  },
};

const MAIN_KEYS = ['title', 'author', 'year', 'journal', 'doi'];

function getDoiUrl(doi) {
  if (!doi) return '';
  const clean = String(doi).trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return `https://doi.org/${clean.replace(/^doi:\s*/i, '')}`;
}

export function MetadataGrid({ data, onHover, onMove, onLeave }) {
  if (!data) return null;

  return (
    <div style={styles.modalGrid}>
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined || value === '') return null;
        
        const displayValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
          
        const isMain = MAIN_KEYS.includes(key.toLowerCase());
        const isFullWidth = ['title', 'author'].includes(key.toLowerCase());

        return (
          <div
            key={key}
            style={{
              ...styles.auditItemBox,
              ...(isFullWidth ? { gridColumn: '1 / -1' } : {})
            }}
            onMouseEnter={(e) => onHover?.(key, displayValue, e)}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            <div style={styles.modalLabel}>{key}</div>
            {isMain ? (
              key.toLowerCase() === 'doi' ? (
                <div style={{ ...styles.modalValue, whiteSpace: 'pre-wrap' }}>
                  <a
                    href={getDoiUrl(value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#58a6ff', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {displayValue} ↗
                  </a>
                </div>
              ) : (
                <div style={{ ...styles.modalValue, whiteSpace: 'pre-wrap' }}>
                  {displayValue}
                </div>
              )
            ) : (
              <div style={{ ...styles.modalValue, color: '#8b949e', fontStyle: 'italic', fontSize: '11px' }}>
                Hover to view
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}