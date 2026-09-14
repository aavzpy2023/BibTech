import React from 'react';
import { useDropzone } from 'react-dropzone';

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

  const onDrop = (acceptedFiles) => {
    if (onInputUpdate) {
      onInputUpdate('files', acceptedFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  });

  return (
    <div style={styles.container}>
      <div>
        <span style={styles.label}>Input Files (BibTeX, RIS, PDF)</span>
        <div
          {...getRootProps()}
          style={{
            ...styles.dropzone,
            ...(isDragActive ? styles.dropzoneActive : {})
          }}
        >
          <input {...getInputProps()} />
          <p style={{ margin: 0, color: '#444' }}>
            Drag or select files here (.bib, .ris, .txt)
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