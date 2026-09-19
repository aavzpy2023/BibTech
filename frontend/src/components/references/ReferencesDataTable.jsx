import React, { useState } from 'react';
import { useReferencesTable } from '../../hooks/useReferencesTable';
import { useTableResize } from '../../hooks/useTableResize';
import ReferenceDetailsModal from './ReferenceDetailsModal';

function getDoiUrl(doi) {
  if (!doi) return '';
  const clean = String(doi).trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  return `https://doi.org/${clean.replace(/^doi:\s*/i, '')}`;
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
    borderRight: '1px solid #30363d',
    padding: '10px 14px',
    fontWeight: '600',
    color: '#f0f6fc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tr: {
    borderBottom: '1px solid #30363d',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  selectedTr: {
    backgroundColor: '#1c2128',
    outline: '1px solid #388bfd',
  },
  detailsBtn: {
    padding: '8px 14px',
    backgroundColor: '#21262d',
    color: '#f0f6fc',
    border: '1px solid #30363d',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  detailsBtnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },

  td: {
    padding: '10px 14px',
    color: '#f0f6fc',
    borderRight: '1px solid #30363d',
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

};

let globalSelectedRows = [];
let globalIsDetailsOpen = false;

export function ReferencesDataTable({ data = [], onSelectionChange }) {
  const [selectedRows, setSelectedRows] = useState(() => {
    if (globalSelectedRows.length === 0) return [];
    if (!data || data.length === 0) return globalSelectedRows;
    const currentIds = new Set(data.map((d) => (d.id != null ? d.id : d)));
    const valid = globalSelectedRows.filter((r) =>
      currentIds.has(r.id != null ? r.id : r)
    );
    return valid.length > 0 ? valid : globalSelectedRows;
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(globalIsDetailsOpen);

  const updateSelectedRows = (newRowsOrUpdater) => {
    setSelectedRows((prev) => {
      const next =
        typeof newRowsOrUpdater === 'function'
          ? newRowsOrUpdater(prev)
          : newRowsOrUpdater;
      globalSelectedRows = next;
      if (onSelectionChange) onSelectionChange(next);
      return next;
    });
  };

  const updateIsDetailsOpen = (isOpen) => {
    globalIsDetailsOpen = isOpen;
    setIsDetailsOpen(isOpen);
  };

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
  } = useReferencesTable(data, 13);

  const { colWidths, handleMouseDown } = useTableResize();

  const isSingleSelected = selectedRows.length === 1;
  const singleSelectedRow = isSingleSelected ? selectedRows[0] : null;

  const isRowSelected = (row) =>
    selectedRows.some((r) =>
      r.id != null && row.id != null ? r.id === row.id : r === row
    );

  const handleCheckboxChange = (row, e) => {
    e.stopPropagation();
    updateSelectedRows((prev) => {
      const exists = prev.some((r) =>
        r.id != null && row.id != null ? r.id === row.id : r === row
      );
      if (exists) {
        return prev.filter((r) =>
          r.id != null && row.id != null ? r.id !== row.id : r !== row
        );
      }
      return [...prev, row];
    });
  };

  const handleRowClick = (row, e) => {
    if (e.target.type === 'checkbox') return;
    if (e.ctrlKey || e.metaKey) {
      handleCheckboxChange(row, e);
    } else {
      updateSelectedRows((prev) => {
        const isOnlyThis =
          prev.length === 1 &&
          (prev[0].id != null && row.id != null
            ? prev[0].id === row.id
            : prev[0] === row);
        if (isOnlyThis) {
          return [];
        }
        return [row];
      });
    }
  };

  const allVisibleSelected =
    paginatedData.length > 0 &&
    paginatedData.every((r) => isRowSelected(r));

  const handleSelectAll = (e) => {
    e.stopPropagation();
    if (allVisibleSelected) {
      const visibleKeys = new Set(
        paginatedData.map((r) => (r.id != null ? r.id : r))
      );
      updateSelectedRows((prev) =>
        prev.filter((r) => !visibleKeys.has(r.id != null ? r.id : r))
      );
    } else {
      const currentKeys = new Set(
        selectedRows.map((r) => (r.id != null ? r.id : r))
      );
      const toAdd = paginatedData.filter(
        (r) => !currentKeys.has(r.id != null ? r.id : r)
      );
      updateSelectedRows((prev) => [...prev, ...toAdd]);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          No references available to display.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button
            type="button"
            style={{
              ...styles.detailsBtn,
              ...(!isSingleSelected ? styles.detailsBtnDisabled : {}),
            }}
            disabled={!isSingleSelected}
            onClick={() => updateIsDetailsOpen(true)}
          >
            View Details
          </button>
        </div>
        <span style={{ fontSize: '13px', color: '#8b949e' }}>
          Total References: {data.length}
          {selectedRows.length > 0 ? ` (${selectedRows.length} selected)` : ''}
        </span>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                aria-label="Select all references on this page"
                checked={allVisibleSelected}
                onChange={handleSelectAll}
                style={{ cursor: 'pointer' }}
              />
            </th>
            <th style={{ ...styles.th, width: `${colWidths.title}%`, position: 'relative' }}>
              Title
              <div
                style={{
                  cursor: 'col-resize', width: '5px', position: 'absolute',
                  right: 0, top: 0, bottom: 0, backgroundColor: 'transparent'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'title')}
              />
            </th>
            <th style={{ ...styles.th, width: `${colWidths.author}%`, position: 'relative' }}>
              Author
              <div
                style={{
                  cursor: 'col-resize', width: '5px', position: 'absolute',
                  right: 0, top: 0, bottom: 0, backgroundColor: 'transparent'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'author')}
              />
            </th>
            <th style={{ ...styles.th, width: `${colWidths.year}%`, position: 'relative' }}>
              Year
              <div
                style={{
                  cursor: 'col-resize', width: '5px', position: 'absolute',
                  right: 0, top: 0, bottom: 0, backgroundColor: 'transparent'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'year')}
              />
            </th>
            <th style={{ ...styles.th, width: `${colWidths.journal}%`, position: 'relative' }}>
              Journal
              <div
                style={{
                  cursor: 'col-resize', width: '5px', position: 'absolute',
                  right: 0, top: 0, bottom: 0, backgroundColor: 'transparent'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'journal')}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => {
            const isSelected = isRowSelected(row);
            return (
              <tr
                key={row.id || index}
                style={{
                  ...styles.tr,
                  ...(isSelected ? styles.selectedTr : {}),
                }}
                onClick={(e) => handleRowClick(row, e)}
              >
              <td
                style={{ ...styles.td, width: '40px', textAlign: 'center' }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  aria-label={`Select reference ${row.title || ''}`}
                  checked={isSelected}
                  onChange={(e) => handleCheckboxChange(row, e)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
              <td style={styles.td} title={row.title || 'N/A'}>
                {row.title || 'N/A'}
              </td>
              <td style={styles.td} title={row.author || 'N/A'}>
                {row.author || 'N/A'}
              </td>
              <td style={styles.td} title={String(row.year || 'N/A')}>
                {row.year || 'N/A'}
              </td>
              <td style={styles.td} title={row.journal || 'N/A'}>
                {row.journal || 'N/A'}
              </td>
            </tr>
            );
          })}
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

      <ReferenceDetailsModal
        isOpen={isDetailsOpen && isSingleSelected}
        onClose={() => updateIsDetailsOpen(false)}
        article={singleSelectedRow}
      />
    </div>
  );
}

export default ReferencesDataTable;
