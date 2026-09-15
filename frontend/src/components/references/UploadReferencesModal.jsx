import React from 'react';
import BibliographyUploader from '../BibliographyUploader';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
    width: '100%',
    maxWidth: '560px',
    padding: '28px',
    boxSizing: 'border-box',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#f0f6fc',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6a737d',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  description: {
    fontSize: '14px',
    color: '#8b949e',
    marginTop: 0,
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#f0f6fc',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    backgroundColor: '#0d1117',
    color: '#f0f6fc',
    border: '1px solid #30363d',
    borderRadius: '6px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  hint: {
    fontSize: '12px',
    color: '#8b949e',
    marginTop: '6px',
    marginBottom: 0,
  },
  uploaderWrapper: {
    transition: 'opacity 0.2s ease',
  },
  errorBox: {
    backgroundColor: '#ffeef0',
    color: '#cb2431',
    border: '1px solid #f97583',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  successBox: {
    backgroundColor: '#dcffe4',
    color: '#165c26',
    border: '1px solid #85e89d',
    padding: '14px 16px',
    borderRadius: '6px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  successTitle: {
    margin: '0 0 6px 0',
    fontWeight: '600',
    fontSize: '15px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
  cancelBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#f0f6fc',
    backgroundColor: '#21262d',
    border: '1px solid #30363d',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export function UploadReferencesModal({
  isOpen,
  onClose,
  projectCode,
  setProjectCode,
  uploadAndInject,
  isLoading,
  isSuccess,
  error,
  insertedCount,
}) {
  if (!isOpen) return null;

  const isProjectReady = Boolean(projectCode && projectCode.trim());

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} data-testid="upload-modal-container">
    <div style={styles.header}>
      <h3 style={styles.title}>New References Ingestion</h3>
      <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
        ✕
          </button>
        </div>

    <p style={styles.description}>
      Enter the project code and select .ris or .bib files to
      persist in the database.
    </p>

    <div style={styles.formGroup}>
      <label htmlFor="modal-project-code" style={styles.label}>
        Project Code or Name *
      </label>
      <input
        id="modal-project-code"
        type="text"
        placeholder="Ex: PROJ-AI-2026"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            style={styles.input}
            autoFocus
          />
      {!isProjectReady && (
        <p style={styles.hint}>
          Provide a project name to enable the uploader.
        </p>
      )}
        </div>

        {error && <div style={styles.errorBox}>❌ {error}</div>}
    {isLoading && (
      <p style={{ color: '#0366d6', fontWeight: '500', fontSize: '14px' }}>
        Injecting references into database...
      </p>
    )}

    {isSuccess && (
      <div style={styles.successBox}>
        <p style={styles.successTitle}>Ingestion completed!</p>
        <p style={{ margin: 0, fontSize: '13px' }}>
          Inserted <strong>{insertedCount}</strong> articles into
          project <strong>{projectCode}</strong>.
        </p>
          </div>
        )}

        <div
          style={{
            ...styles.uploaderWrapper,
            opacity: isProjectReady ? 1 : 0.45,
            pointerEvents: isProjectReady ? 'auto' : 'none',
          }}
        >
          <BibliographyUploader
            onUpload={(file) => {
              if (isProjectReady) {
                uploadAndInject(file);
              }
            }}
          />
        </div>

    <div style={styles.footer}>
      <button style={styles.cancelBtn} onClick={onClose}>
        {isSuccess ? 'Close' : 'Cancel'}
      </button>
    </div>
      </div>
    </div>
  );
}

export default UploadReferencesModal;