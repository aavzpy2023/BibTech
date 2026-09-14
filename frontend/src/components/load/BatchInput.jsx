import React from 'react';
import { useDropzone } from 'react-dropzone';

export function extractDoisFromText(text, filename = '') {
  const isRis = filename.toLowerCase().endsWith('.ris');
  const isBib = filename.toLowerCase().endsWith('.bib');
  const foundDois = [];

  if (isRis || (!isBib && text.includes('DO  -'))) {
    const risRegex = /^[ \t]*DO\s+-\s+(.+)$/gim;
    let match;
    while ((match = risRegex.exec(text)) !== null) {
      const doi = match[1].trim();
      if (doi && !foundDois.includes(doi)) {
        foundDois.push(doi);
      }
    }
  }

  if (isBib || (!isRis && (text.includes('DOI =') || text.includes('doi =')))) {
    const bibRegex = /\bdoi\s*=\s*(?:\{([^}]+)\}|"([^"]+)")/gi;
    let match;
    while ((match = bibRegex.exec(text)) !== null) {
      const doi = (match[1] || match[2] || '').trim();
      if (doi && !foundDois.includes(doi)) {
        foundDois.push(doi);
      }
    }
  }

  if (foundDois.length === 0) {
    const genericRegex = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/gi;
    let match;
    while ((match = genericRegex.exec(text)) !== null) {
      const doi = match[0].trim();
      if (doi && !foundDois.includes(doi)) {
        foundDois.push(doi);
      }
    }
  }

  return foundDois;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  dropzone: {
    border: '2px dashed #0366d6',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f6f8fa'
  },
  dropzoneActive: {
    backgroundColor: '#e1f5fe',
    borderColor: '#0288d1'
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #d1d5da',
    fontFamily: 'monospace',
    fontSize: '13px',
    boxSizing: 'border-box'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#24292e',
    marginBottom: '6px',
    display: 'block'
  },
  fileList: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#586069'
  }
};

export function BatchInput({
  files = [],
  dois = '',
  input,
  onInputUpdate
}) {
  const currentFiles = input?.files ?? files;
  const currentDois = input?.dois ?? dois;

  const onDrop = async (acceptedFiles) => {
    const validFiles = (acceptedFiles || []).filter((file) => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ext === 'bib' || ext === 'ris';
    });

    if (validFiles.length === 0) return;

    if (onInputUpdate) {
      onInputUpdate('files', validFiles);
    }

    const allExtractedDois = [];
    for (const file of validFiles) {
      try {
        const text = await file.text();
        const extracted = extractDoisFromText(text, file.name);
        allExtractedDois.push(...extracted);
      } catch (err) {
        console.error('Failed to read file for DOI extraction', err);
      }
    }

    if (allExtractedDois.length > 0 && onInputUpdate) {
      const existing = currentDois
        ? currentDois
            .split('\n')
            .map((d) => d.trim())
            .filter(Boolean)
        : [];
      const merged = Array.from(new Set([...existing, ...allExtractedDois]));
      onInputUpdate('dois', merged.join('\n'));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.bib', '.ris'],
      'application/x-bibtex': ['.bib'],
      'application/x-research-info-systems': ['.ris']
    }
  });

  return (
    <div style={styles.container}>
      <div>
        <span style={styles.label}>Input Files (.bib, .ris)</span>
        <div
          {...getRootProps()}
          style={{
            ...styles.dropzone,
            ...(isDragActive ? styles.dropzoneActive : {})
          }}
        >
          <input {...getInputProps()} />
          <p style={{ margin: 0, color: '#444' }}>
            Drag or select files here / Arrastra o selecciona archivos (.bib, .ris)
          </p>
          {currentFiles && currentFiles.length > 0 && (
            <div style={styles.fileList}>
              {currentFiles.length} file(s) selected
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="batch-dois-textarea" style={styles.label}>
          List of DOIs (one per line)
        </label>
        <textarea
          id="batch-dois-textarea"
          style={styles.textarea}
          placeholder="10.1000/182&#10;10.1000/183"
          value={currentDois}
          onChange={(e) => {
            if (onInputUpdate) {
              onInputUpdate('dois', e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
}

export default BatchInput;