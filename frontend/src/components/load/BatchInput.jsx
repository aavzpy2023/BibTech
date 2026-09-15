import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function extractDoisFromText(text, filename = '') {
  const isBib = filename.toLowerCase().endsWith('.bib');
  const foundDois = [];
  const missingDoisAlerts = [];

  if (!isBib) {
    return { foundDois, missingDoisAlerts };
  }

  // Fallback para evitar errores en variables no usadas (isRis)
  if (false) {
    const risRegex = /^[ \t]*DO\s+-\s+(.+)$/gim;
    let match;
    while ((match = risRegex.exec(text)) !== null) {
      const doi = match[1].trim();
      if (doi && !foundDois.includes(doi)) {
        foundDois.push(doi);
      }
    }
  }

  if (isBib) {
    const entryRegex = /@\w+\s*{\s*([^,]+)/gi;
    let entryMatch;
    
    while ((entryMatch = entryRegex.exec(text)) !== null) {
      const citationKey = entryMatch[1].trim();
      
      const startIndex = entryMatch.index;
      let openBraces = 0;
      let endIndex = startIndex;
      let started = false;
      
      for (let i = startIndex; i < text.length; i++) {
        if (text[i] === '{') {
          openBraces++;
          started = true;
        } else if (text[i] === '}') {
          openBraces--;
        }
        if (started && openBraces === 0) {
          endIndex = i;
          break;
        }
      }
      
      const entryText = text.substring(startIndex, endIndex + 1);
      
      const bibRegex = /\bdoi\s*=\s*(?:\{([^}]+)\}|"([^"]+)")/i;
      const doiMatch = bibRegex.exec(entryText);
      
      if (doiMatch) {
        const doi = (doiMatch[1] || doiMatch[2] || '').trim();
        if (doi && !foundDois.includes(doi)) {
          foundDois.push(doi);
        }
      } else {
        missingDoisAlerts.push(`Citation key [${citationKey}] is missing a DOI.`);
      }
    }
  }

  if (false && foundDois.length === 0) {
    const genericRegex = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/gi;
    let match;
    while ((match = genericRegex.exec(text)) !== null) {
      const doi = match[0].trim();
      if (doi && !foundDois.includes(doi)) {
        foundDois.push(doi);
      }
    }
  }

  return { foundDois, missingDoisAlerts };
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
    minHeight: '300px',
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
  },
  uploadBtn: {
    backgroundColor: '#0366d6', color: '#ffffff', border: 'none', borderRadius: '6px',
    padding: '8px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '450px', maxWidth: '90%'
  },
  badge: {
    backgroundColor: '#e1e4e8', color: '#24292e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: '8px'
  },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
  }
};

export function BatchInput({
  files = [],
  dois = '',
  input,
  onInputUpdate
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missingDois, setMissingDois] = useState([]);
  const currentFiles = input?.files ?? files;
  const currentDois = input?.dois ?? dois;

  const onDrop = async (acceptedFiles) => {
    const validFiles = (acceptedFiles || []).filter((file) => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ext === 'bib';
    });

    if (validFiles.length === 0) {
      alert("Only .bib files are accepted for this operation.");
      return;
    }

    if (onInputUpdate) {
      onInputUpdate('files', validFiles);
    }

    const allExtractedDois = [];
    const allMissingAlerts = [];
    for (const file of validFiles) {
      try {
        const text = await file.text();
        const { foundDois, missingDoisAlerts } = extractDoisFromText(text, file.name);
        allExtractedDois.push(...foundDois);
        allMissingAlerts.push(...missingDoisAlerts);
      } catch (err) {
        console.error('Failed to read file for DOI extraction', err);
      }
    }

    if (allMissingAlerts.length > 0) {
      setMissingDois(allMissingAlerts);
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
    setIsModalOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.bib'],
      'application/x-bibtex': ['.bib']
    }
  });

  const doiList = currentDois ? currentDois.split('\n').map(d => d.trim()).filter(Boolean) : [];
  const uniqueDois = Array.from(new Set(doiList));
  const doiCount = uniqueDois.length;

  const handleBlur = () => {
    if (currentDois && onInputUpdate) {
      onInputUpdate('dois', uniqueDois.join('\n'));
    }
  };

  const downloadMissingTxt = () => {
    const blob = new Blob([missingDois.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'missing_dois.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <label htmlFor="batch-dois-textarea" style={{ ...styles.label, marginBottom: 0 }}>
          List of DOIs (one per line)
          <span style={styles.badge}>{doiCount} PDFs to download</span>
        </label>
        <button type="button" style={styles.uploadBtn} onClick={() => setIsModalOpen(true)}>
          + Upload files
        </button>
      </div>
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.headerRow}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Extract DOIs</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: '#586069', marginBottom: '16px' }}>Select .bib files to automatically extract DOIs.</p>
        <div
          {...getRootProps()}
          style={{
            ...styles.dropzone,
            ...(isDragActive ? styles.dropzoneActive : {})
          }}
        >
          <input {...getInputProps()} />
          <p style={{ margin: 0, color: '#444' }}>
            Drag or select files here / Arrastra o selecciona archivos (.bib)
          </p>
          {currentFiles && currentFiles.length > 0 && (
            <div style={styles.fileList}>
              {currentFiles.length} file(s) selected
            </div>
          )}
        </div>
          </div>
        </div>
      )}

      {missingDois.length > 0 && (
        <div style={styles.modalOverlay} onClick={() => setMissingDois([])}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.headerRow}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#cb2431' }}>Missing DOIs</h3>
              <button type="button" onClick={() => setMissingDois([])} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: '#586069', marginBottom: '16px' }}>
              The following citation keys did not have a valid DOI associated with them:
            </p>
            <ul style={{ fontSize: '13px', color: '#24292e', maxHeight: '200px', overflowY: 'auto', paddingLeft: '20px', margin: '0 0 16px 0', fontFamily: 'monospace' }}>
              {missingDois.map((msg, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{msg}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={downloadMissingTxt} style={{ ...styles.uploadBtn, backgroundColor: '#2ea44f' }}>
                Download .txt
              </button>
              <button type="button" onClick={() => setMissingDois([])} style={{ ...styles.uploadBtn, backgroundColor: '#f6f8fa', color: '#24292e', border: '1px solid #d1d5da' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <textarea
          onBlur={handleBlur}
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