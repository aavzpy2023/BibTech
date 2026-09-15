import React from 'react';
import { useDropzone } from 'react-dropzone';

const styles = {
  dropzone: {
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#161b22',
    border: '2px dashed #30363d',
    marginBottom: '24px',
    transition: 'all 0.2s ease'
  },
  dropzoneActive: {
    backgroundColor: '#1f2937',
    borderColor: '#58a6ff'
  },
  text: {
    margin: 0,
    color: '#8b949e',
    fontSize: '14px'
  }
};

export function BibliographyUploader({ onUpload }) {
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0 && onUpload) {
      onUpload(acceptedFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.ris', '.bib']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      style={{
        ...styles.dropzone,
        ...(isDragActive ? styles.dropzoneActive : {})
      }}
    >
      <input {...getInputProps()} />
      <p style={styles.text}>
        Drag or select files here (.ris, .bib)
      </p>
    </div>
  );
}

export default BibliographyUploader;