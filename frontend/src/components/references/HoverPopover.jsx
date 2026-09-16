import React from 'react';

const styles = {
  popover: {
    position: 'fixed',
    backgroundColor: '#161b22',
    color: '#f6f8fa',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    maxWidth: '540px',
    maxHeight: '380px',
    overflowY: 'auto',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    pointerEvents: 'none',
    border: '1px solid #388bfd',
  },
  key: {
    fontWeight: '600',
    marginBottom: '6px',
    color: '#58a6ff',
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '0.5px',
  },
  value: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    lineHeight: '1.4',
  },
};

export function HoverPopover({ info }) {
  if (!info?.isVisible) return null;

  return (
    <div
      style={{
        ...styles.popover,
        left: `${info.x + 15}px`,
        top: `${info.y + 15}px`,
      }}
      data-testid="hover-popover"
    >
      <div style={styles.key}>{info.key}</div>
      <div style={styles.value}>{info.value}</div>
    </div>
  );
}