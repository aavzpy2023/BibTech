import React from 'react';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    maxHeight: '440px',
    overflowY: 'auto',
    padding: '4px',
  },
  fieldChip: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    color: '#c9d1d9',
    cursor: 'help',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
    userSelect: 'none',
  },
  keyText: {
    fontWeight: '600',
    color: '#58a6ff',
  },
  hintText: {
    fontSize: '11px',
    color: '#8b949e',
  },
};

const EXCLUDED_KEYS = new Set([
  'id',
  'project_id',
  'created_at',
  'updated_at',
  'project_status',
  'project_added_at',
  'upload_datetime',
  'raw_data',
  'raw_bibtex',
]);

function formatKey(key) {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseBibtexFields(raw) {
  if (!raw || typeof raw !== 'string') return {};
  const fields = {};
  const bodyStart = raw.indexOf(',');
  if (bodyStart === -1) return {};
  const body = raw.slice(bodyStart + 1);

  let i = 0;
  const n = body.length;
  while (i < n) {
    while (i < n && /[\s,]/.test(body[i])) i++;
    if (i >= n || body[i] === '}') break;

    const keyStart = i;
    while (i < n && body[i] !== '=' && body[i] !== '}' && !/\s/.test(body[i])) {
      i++;
    }
    const key = body.slice(keyStart, i).trim();
    while (i < n && /[\s=]/.test(body[i])) i++;
    if (i >= n || body[i] === '}') break;

    let val = '';
    if (body[i] === '{') {
      i++;
      let depth = 1;
      const valStart = i;
      while (i < n && depth > 0) {
        if (body[i] === '{') depth++;
        else if (body[i] === '}') depth--;
        if (depth > 0) i++;
      }
      val = body.slice(valStart, i).trim();
      i++;
    } else if (body[i] === '"') {
      i++;
      const valStart = i;
      while (i < n && body[i] !== '"') {
        if (body[i] === '\\' && i + 1 < n) i++;
        i++;
      }
      val = body.slice(valStart, i).trim();
      i++;
    } else {
      const valStart = i;
      while (i < n && body[i] !== ',' && body[i] !== '}' && body[i] !== '\n') {
        i++;
      }
      val = body.slice(valStart, i).trim();
    }

    if (key && val) {
      fields[key] = val.replace(/\\_/g, '_').replace(/\s+/g, ' ');
    }
  }
  return fields;
}

export function MetadataGrid({ data, onHover, onMove, onLeave }) {
  if (!data) return null;

  const rawBibtex = data.raw_data || data.raw_bibtex || '';
  const bibtexFields = parseBibtexFields(rawBibtex);
  const combined = { ...bibtexFields, ...data };

  return (
    <div style={styles.container}>
      {Object.entries(combined).map(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (
          EXCLUDED_KEYS.has(lowerKey) ||
          value === null ||
          value === undefined ||
          value === ''
        ) {
          return null;
        }

        const displayValue =
          typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : String(value);
        const formattedKey = formatKey(key);

        return (
          <div
            key={key}
            style={styles.fieldChip}
            onMouseEnter={(e) => onHover?.(formattedKey, displayValue, e)}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            <span style={styles.keyText}>{formattedKey}</span>
            <span style={styles.hintText}>👁️</span>
          </div>
        );
      })}
    </div>
  );
}