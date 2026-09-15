import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadView from './views/LoadView';
import QueueView from './views/QueueView';
import AnalysisView from './views/AnalysisView';
import ReferencesView from './views/ReferencesView';
import BibliographyUploader from './components/BibliographyUploader';
import ReferenceTable from './components/ReferenceTable';
import { useBibliography } from './hooks/useBibliography';

export function DashboardView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { references, isLoading, error: uploadError, uploadFile } = useBibliography();

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
    container: { fontFamily: 'system-ui, sans-serif', padding: '0', textAlign: 'center', color: '#f0f6fc' },
    card: { border: 'none', borderRadius: '12px', padding: '24px', backgroundColor: '#161b22', textAlign: 'left' },
    badge: { backgroundColor: '#1f6feb22', color: '#58a6ff', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', marginBottom: '15px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#f0f6fc', margin: '0 0 8px 0' }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>¡Proyecto bibtech Inicializado! 🎉</h1>
      <div style={styles.card}>
        <h3>Ingesta de Bibliografía</h3>
        {uploadError && <p style={{color: 'red', fontWeight: 'bold'}}>❌ {uploadError}</p>}
        {isLoading && <p style={{color: '#0366d6'}}>Procesando archivo...</p>}
        
        <BibliographyUploader onUpload={uploadFile} />
        <ReferenceTable references={references} />
        
        <hr style={{margin: '32px 0', border: 'none', borderTop: '1px solid #30363d'}} />
        
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardView />} />
          <Route path="load" element={<LoadView />} />
          <Route path="queue" element={<QueueView />} />
          <Route path="analysis" element={<AnalysisView />} />
          <Route path="references" element={<ReferencesView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
