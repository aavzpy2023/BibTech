import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/requirements')
      .then(res => {
        if (!res.ok) throw new Error('Error al conectar con el servidor');
        return res.json();
      })
      .then(data => setData(data))
      .catch(err => setError(err.message));
  }, []);

  const styles = {
    container: { fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', color: '#333' },
    card: { border: '1px solid #e1e4e8', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#fff', textAlign: 'left' },
    badge: { backgroundColor: '#e2f5ea', color: '#137333', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' }
  };

  return (
    <div style={styles.container}>
      <h1>¡Proyecto bibtech Inicializado! 🎉</h1>
      <div style={styles.card}>
        <h3>Parámetros Modernos Detectados:</h3>
        {error && <p style={{color: 'red'}}>❌ {error}</p>}
        {!data && !error && <p>Cargando requerimientos...</p>}
        {data && (
          <div>
            <span style={styles.badge}>{data.status}</span>
            <ul>
              <li><strong>Estructura:</strong> bibtech</li>
              <li><strong>Configuración Backend:</strong> pyproject.toml (PEP 621)</li>
              <li><strong>Base de Datos:</strong> {data.database}</li>
              <li><strong>Ruteo/Proxy:</strong> {data.proxy}</li>
              <li><strong>Backend Framework:</strong> Python + {data.framework}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;
