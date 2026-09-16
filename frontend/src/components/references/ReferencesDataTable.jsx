import React, { useState } from 'react';
import { useReferencesTable } from '../../hooks/useReferencesTable';

function formatShortAuthor(authorStr) {
  if (!authorStr || authorStr === 'N/A') return 'N/A';
  const first = authorStr.trim().split(/\s+and\s+|;\s*/i)[0].trim();
  if (!first) return 'N/A';
  const surname = first.includes(',')
    ? first.split(',')[0].trim()
    : (first.split(/\s+/).pop() || first);
  return `${surname} ...`;
}

const styles = {
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    backgroundColor: '#0d1117',
    color: '#f0f6fc',
    width: '300px',
    outline: 'none',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    padding: '8px 0',
  },
  pageBtn: {
    padding: '6px 12px',
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
    color: '#f0f6fc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  container: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '20px',
    position: 'relative',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed',
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
  } = useReferencesTable(data, 13);

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
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <span style={{ fontSize: '13px', color: '#8b949e' }}>
          Total References: {data.length}
        </span>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '45%' }}>Title</th>
            <th style={{ ...styles.th, width: '20%' }}>Author</th>
            <th style={{ ...styles.th, width: '10%' }}>Year</th>
            <th style={{ ...styles.th, width: '25%' }}>Journal</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr
              key={row.id || index}
              style={styles.tr}
              onMouseMove={(e) => handleMouseMove(e, row)}
              onMouseLeave={handleMouseLeave}
            >
              <td style={styles.td} title={row.title || 'N/A'}>
                {row.title || 'N/A'}
              </td>
              <td style={styles.td} title={row.author || 'N/A'}>
                {formatShortAuthor(row.author)}
              </td>
              <td style={styles.td} title={String(row.year || 'N/A')}>
                {row.year || 'N/A'}
              </td>
              <td style={styles.td} title={row.journal || 'N/A'}>
                {row.journal || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {}) }}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span style={{ fontSize: '14px', color: '#8b949e' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {}) }}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {hoveredRow && (
        <div
          style={{
            ...styles.popover,
            top: `${coords.y}px`,
            left: `${coords.x}px`,
          }}
        >
          <div style={{ fontWeight: '600', color: '#58a6ff', marginBottom: '6px' }}>
            {hoveredRow.title || 'Untitled'}
          </div>
          <div style={{ marginBottom: '6px', lineHeight: '1.4' }}>
            <span style={{ color: '#8b949e', fontWeight: '500' }}>Authors: </span>
            <span style={{ color: '#f0f6fc' }}>{hoveredRow.author || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
            <div>
              <span style={{ color: '#8b949e' }}>Year: </span>
              <span style={{ color: '#f0f6fc' }}>{hoveredRow.year || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: '#8b949e' }}>Journal: </span>
              <span style={{ color: '#f0f6fc' }}>{hoveredRow.journal || 'N/A'}</span>
            </div>
          </div>
          {hoveredRow.doi && (
            <div>
              <span style={{ color: '#8b949e' }}>DOI: </span>
              <span style={{ color: '#79c0ff' }}>{hoveredRow.doi}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferencesDataTable;