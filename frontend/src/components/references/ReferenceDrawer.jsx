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
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1200,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: {
    backgroundColor: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #1e293b',
    backgroundColor: '#0F172A',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  badge: {
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    borderRadius: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxSizing: 'border-box',
  },
  item: {
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: '#131d31',
    border: '1px solid #1e293b',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  empty: {
    textAlign: 'center',
    padding: '36px 0',
    color: '#64748b',
    fontSize: '13px',
    fontStyle: 'italic',
  },
};

export default function ReferenceDrawer({
  isOpen,
  onClose,
  title,
  type = 'references',
  data = [],
}) {
  if (!isOpen) return null;

  const content = (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Field Details'}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleWrapper}>
            <h3 style={styles.title}>{title || 'Details'}</h3>
            {data && data.length > 0 && (
              <span style={styles.badge}>{data.length}</span>
            )}
          </div>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              style={{ width: '20px', height: '20px', flexShrink: 0 }}
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

        {/* Content Body */}
        <div style={styles.body}>
          {!data || data.length === 0 ? (
            <div style={styles.empty}>No items available</div>
          ) : (
            data.map((item, index) => (
              <div
                key={item.id || index}
                data-testid="drawer-item"
                style={styles.item}
              >
                {type === 'references' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontWeight: '500', color: '#e2e8f0', lineHeight: '1.4' }}>
                      {item.title || item.raw_citation || 'Untitled Reference'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
                      {item.year && <span>Year: {item.year}</span>}
                      {item.doi && (
                        <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                          DOI: {item.doi}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {type === 'authors' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '600', color: '#e2e8f0' }}>
                        {item.name || 'Unknown Author'}
                      </span>
                      {item.is_corresponding && (
                        <span
                          style={{
                            padding: '2px 6px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            backgroundColor: 'rgba(30, 58, 138, 0.4)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            borderRadius: '4px',
                          }}
                        >
                          Corresponding
                        </span>
                      )}
                    </div>
                    {item.affiliation && (
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {item.affiliation}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '2px', fontSize: '12px', color: '#64748b' }}>
                      {item.email && <span>Email: {item.email}</span>}
                      {item.orcid && <span>ORCID: {item.orcid}</span>}
                    </div>
                  </div>
                )}

                {type === 'funding' && (
                  typeof item === 'string' ? (
                    <div style={{ color: '#e2e8f0', lineHeight: '1.6', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                      {item}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: '600', color: '#e2e8f0' }}>
                        {item.agency || 'Funding Agency'}
                      </div>
                      {item.grant_number && (
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Grant: <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{item.grant_number}</span>
                        </div>
                      )}
                      {item.country && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.country}</div>
                      )}
                    </div>
                  )
                )}

                {type === 'abstract' && (
                  <div style={{ color: '#e2e8f0', lineHeight: '1.7', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </div>
                )}

                {type !== 'references' &&
                  type !== 'authors' &&
                  type !== 'funding' && (
                    <div style={{ color: '#cbd5e1' }}>
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

ReferenceDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  type: PropTypes.oneOf([
    'references',
    'authors',
    'funding',
    'abstract',
    'affiliations',
    'generic',
  ]),
  data: PropTypes.array,
};