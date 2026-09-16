import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 15, 30, 0.85)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: (maxWidth) => ({
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    width: '100%',
    maxWidth: typeof maxWidth === 'string' && maxWidth.includes('px')
      ? maxWidth
      : '1180px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0F172A',
  },
  headerContent: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    position: 'relative',
    boxSizing: 'border-box',
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #1e293b',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
};

export default function ModalTemplate({
  isOpen,
  onClose,
  header,
  footer,
  children,
  maxWidth = '1180px',
}) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.modal(maxWidth)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={styles.header}>
          <div style={styles.headerContent}>{header}</div>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close modal"
          >
            <svg
              style={{ width: '22px', height: '22px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div style={styles.body}>{children}</div>

        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

ModalTemplate.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};