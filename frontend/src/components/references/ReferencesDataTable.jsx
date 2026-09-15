import React, { useState } from 'react';

const styles = {
  container: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '20px',
    position: 'relative',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
  },
  th: {
    backgroundColor: '#161b22',
    borderBottom: '1px solid #30363d',
    padding: '10px 14px',
    fontWeight: '600',
    color: '#f0f6fc',
  },
  tr: {
    borderBottom: '1px solid #30363d',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '10px 14px',
    color: '#f0f6fc',
  },
  empty: {
    padding: '24px',
    textAlign: 'center',
    color: '#8b949e',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  popover: {
    position: 'fixed',
    backgroundColor: '#1f2428',
    color: '#f6f8fa',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    maxWidth: '400px',
    maxHeight: '260px',
    overflow: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  pre: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'monospace',
  },
};

export function ReferencesDataTable({ data = [] }) {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          No references available to display.
        </div>
      </div>
    );
  }

  const handleMouseMove = (e, row) => {
    setHoveredRow(row);
    setCoords({ x: e.clientX + 16, y: e.clientY + 16 });
  };

  const handleMouseLeave = () => {
    setHoveredRow(null);
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Author</th>
            <th style={styles.th}>Year</th>
            <th style={styles.th}>Journal</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              style={styles.tr}
              onMouseMove={(e) => handleMouseMove(e, row)}
              onMouseLeave={handleMouseLeave}
            >
              <td style={styles.td}>{row.title || 'N/A'}</td>
              <td style={styles.td}>{row.author || 'N/A'}</td>
              <td style={styles.td}>{row.year || 'N/A'}</td>
              <td style={styles.td}>{row.journal || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {hoveredRow && (
        <div
          style={{
            ...styles.popover,
            top: `${coords.y}px`,
            left: `${coords.x}px`,
          }}
        >
          <pre style={styles.pre}>
            {JSON.stringify(hoveredRow, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ReferencesDataTable;