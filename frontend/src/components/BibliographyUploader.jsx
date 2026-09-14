import React from 'react';
import { useDropzone } from 'react-dropzone';

const styles = {
  dropzone: {
    border: '2px dashed #0366d6',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f6f8fa',
    marginBottom: '24px',
    transition: 'background-color 0.2s ease'
  },
  dropzoneActive: {
    backgroundColor: '#e1f5fe',
    borderColor: '#0288d1'
  },
  text: {
    margin: 0,
    color: '#24292e',
    fontSize: '16px',
    fontWeight: '500'
  },
  subtext: {
    margin: '8px 0 0 0',
    color: '#586069',
    fontSize: '14px'
  }
};

export function BibliographyUploader({ onUpload }) {
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0 && onUpload) {
      onUpload(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.ris', '.bib']
    },
    multiple: false
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
        Arrastra y suelta un archivo bibliográfico aquí, o haz clic para seleccionar
      </p>
      <p style={styles.subtext}>Formatos soportados: .ris, .bib</p>
    </div>
  );
}

export default BibliographyUploader;