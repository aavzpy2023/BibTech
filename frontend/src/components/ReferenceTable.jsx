import React from 'react';
import { format, parseISO } from 'date-fns';

const styles = {
  container: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '24px',
    border: '1px solid #e1e4e8',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  th: {
    backgroundColor: '#f6f8fa',
    padding: '12px 16px',
    borderBottom: '1px solid #e1e4e8',
    color: '#24292e',
    fontWeight: '600'
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e1e4e8',
    color: '#24292e'
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: '#586069'
  }
};

export function ReferenceTable({ references = [] }) {
  if (!references || references.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          No hay referencias cargadas. Sube un archivo para comenzar.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Autor</th>
            <th style={styles.th}>Año</th>
            <th style={styles.th}>Título</th>
            <th style={styles.th}>Revista</th>
            <th style={styles.th}>Fecha de Carga</th>
          </tr>
        </thead>
        <tbody>
          {references.map((ref, index) => {
            const dateStr = ref.upload_datetime
              ? format(parseISO(ref.upload_datetime), 'dd/MM/yyyy HH:mm')
              : '-';
              
            return (
              <tr key={index}>
                <td style={styles.td}>{ref.author || '-'}</td>
                <td style={styles.td}>{ref.year || '-'}</td>
                <td style={styles.td}>{ref.title || '-'}</td>
                <td style={styles.td}>{ref.journal || '-'}</td>
                <td style={styles.td}>{dateStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ReferenceTable;