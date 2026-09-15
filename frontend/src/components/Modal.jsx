import React from 'react';

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
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
    width: '100%',
    maxWidth: '450px',
    padding: '24px',
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
    fontSize: '18px',
    fontWeight: '600',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#8b949e',
    padding: 0,
  },
  description: {
    fontSize: '14px',
    color: '#8b949e',
    marginTop: 0,
    marginBottom: '20px',
  },
};

export function Modal({ isOpen, onClose, title, description, titleColor = '#f0f6fc', children }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose} data-testid="modal-overlay">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} data-testid="modal-content">
        <div style={styles.header}>
          <h3 style={{ ...styles.title, color: titleColor }}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        {description && <p style={styles.description}>{description}</p>}
        {children}
      </div>
    </div>
  );
}

export default Modal;