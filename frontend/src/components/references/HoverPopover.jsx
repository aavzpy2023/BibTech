import React from 'react';

const styles = {
  popover: {
    position: 'fixed',
    backgroundColor: '#1f2428',
    color: '#f6f8fa',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    maxWidth: '400px',
    maxHeight: '260px',
    overflow: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    zIndex: 1000,
    pointerEvents: 'none',
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