import React from 'react';

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e1e4e8',
    borderRadius: '8px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#24292e',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#586069',
    margin: 0
  }
};

export function AnalysisView() {
  return (
    <div style={styles.container} data-testid="analysis-view">
      <h2 style={styles.title}>Bibliographic Analysis</h2>
      <p style={styles.subtitle}>
        Analyze bibliographic metadata and downloaded publications.
      </p>
    </div>
  );
}

export default AnalysisView;