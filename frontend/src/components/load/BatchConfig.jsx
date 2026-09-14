import React from 'react';




const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#fafbfc',
    border: '1px solid #e1e4e8',
    borderRadius: '8px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#24292e'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  slider: {
    flex: 1,
    cursor: 'pointer'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  inputsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5da',
    fontSize: '14px'
  }
};

export function BatchConfig({
  delay = 5,
  destination = '',
  email = '',
  config,
  onConfigUpdate
}) {
  const currentDelay = config?.delay ?? delay;
  const currentDestination = config?.destination ?? destination;
  const currentEmail = config?.email ?? email;




  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <label htmlFor="delay-slider" style={styles.label}>
          Delay between downloads: {currentDelay}s
        </label>
        <div style={styles.sliderContainer}>
          <input
            id="delay-slider"
            role="slider"
            type="range"
            min="5"
            max="60"
            step="5"
            value={currentDelay}
            style={styles.slider}
            onChange={(e) => {
              if (onConfigUpdate) {
                onConfigUpdate('delay', Number(e.target.value));
              }
            }}
          />
          <span style={{ fontSize: '12px', color: '#586069' }}>
            [5s, 15s, 30s, 60s]
          </span>
        </div>
      </div>




        </div>
      </div>

      <div style={styles.inputsGrid}>
        <div style={styles.section}>
          <label htmlFor="destination-input" style={styles.label}>
            Destination Folder
          </label>
          <input
            id="destination-input"
            type="text"
            style={styles.input}
            placeholder="Download folder or path"
            value={currentDestination}
            onChange={(e) => {
              if (onConfigUpdate) {
                onConfigUpdate('destination', e.target.value);
              }
            }}
          />
        </div>

        <div style={styles.section}>
          <label htmlFor="email-input" style={styles.label}>
            Email Address (Polite Pool)
          </label>
          <input
            id="email-input"
            type="email"
            style={styles.input}
            placeholder="Email for academic APIs"
            value={currentEmail}
            onChange={(e) => {
              if (onConfigUpdate) {
                onConfigUpdate('email', e.target.value);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default BatchConfig;