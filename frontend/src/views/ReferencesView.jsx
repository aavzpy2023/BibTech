import React, { useState } from 'react';
import { useReferencesUpload } from '../hooks/useReferencesUpload';
import ReferencesDataTable from '../components/references/ReferencesDataTable';
import UploadReferencesModal from '../components/references/UploadReferencesModal';

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    padding: '0',
    color: '#24292e',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  modalBtn: {
    backgroundColor: '#0366d6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
  card: {
    border: 'none',
    borderRadius: '10px',
    padding: '24px',
    backgroundColor: '#161b22',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#f0f6fc',
    margin: '0 0 8px 0'
  },
  description: {
    fontSize: '14px',
    color: '#586069',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: '500',
    marginBottom: '8px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    maxWidth: '380px',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5da',
    borderRadius: '6px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  hint: {
    fontSize: '12px',
    color: '#6a737d',
    marginTop: '6px',
  },
  uploaderWrapper: {
    transition: 'opacity 0.2s ease',
  },
  errorBox: {
    backgroundColor: '#ffeef0',
    color: '#cb2431',
    border: '1px solid #f97583',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  successBox: {
    backgroundColor: '#dcffe4',
    color: '#165c26',
    border: '1px solid #85e89d',
    padding: '16px',
    borderRadius: '6px',
    marginTop: '24px',
  },
  successTitle: {
    fontWeight: '600',
    margin: '0 0 8px 0',
    fontSize: '16px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '4px',
  },
};

let cachedTableData = [];

export function ReferencesView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState(cachedTableData);
  const [_dummyState, _setDummy] = useState([
    {
      id: 1,
      title: 'Attention Is All You Need',
      author: 'Vaswani, A. et al.',
      year: 2017,
      journal: 'NeurIPS',
    },
    {
      id: 2,
      title: 'Deep Residual Learning for Image Recognition',
      author: 'He, K. et al.',
      year: 2016,
      journal: 'CVPR',
    },
  ]);

  const {
    projectCode,
    setProjectCode,
    isLoading,
    isSuccess,
    error,
    insertedCount,
    uploadAndInject,
    resetStatus,
  } = useReferencesUpload();

  const fetchProjectReferences = React.useCallback(async (code) => {
    if (!code || !code.trim()) {
      setTableData([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/bibliography/references?project_code=${encodeURIComponent(code.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        cachedTableData = data;
        setTableData(data);
      }
    } catch {
      // Ignorado si falla la red
    }
  }, []);

  React.useEffect(() => {
    if (projectCode) {
      fetchProjectReferences(projectCode);
    }
  }, [projectCode, fetchProjectReferences]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
      <h2 style={{ ...styles.title, margin: 0 }}>
        Bibliographic References
      </h2>
      <p style={{ ...styles.description, margin: '4px 0 0 0' }}>
        View and manage persisted publications.
        {projectCode && (
          <span> Active project: <strong>{projectCode}</strong></span>
        )}
          </p>
        </div>
        <button
          style={styles.modalBtn}
      onClick={() => {
        if (resetStatus) resetStatus();
        setIsModalOpen(true);
      }}
    >
      + Add
    </button>
      </div>

      <div style={styles.card}>
        <ReferencesDataTable data={tableData} />
      </div>

      <UploadReferencesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectCode={projectCode}
        setProjectCode={setProjectCode}
        uploadAndInject={async (files) => {
          const parsed = await uploadAndInject(files);
          if (parsed) {
            fetchProjectReferences(projectCode);
          }
        }}
        isLoading={isLoading}
        isSuccess={isSuccess}
        error={error}
        insertedCount={insertedCount}
      />
    </div>
  );
}

function _legacyUnused() {
  return (
    <div>
      <div>
        <h2>Ingesta</h2>
        <p style={styles.description}>
          Asocie archivos bibliográficos (.ris o .bib) a un proyecto de
          investigación para persistir sus artículos.
        </p>

        <div style={styles.formGroup}>
          <label htmlFor="project-code-input" style={styles.label}>
            Código del Proyecto *
          </label>
          <input
            id="project-code-input"
            type="text"
            placeholder="Ej: PROJ-AI-2026"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            style={styles.input}
          />
          {!isProjectReady && (
            <p style={styles.hint}>
              Debe ingresar un código de proyecto para habilitar el cargador.
            </p>
          )}
        </div>

        {error && <div style={styles.errorBox}>❌ {error}</div>}
        {isLoading && (
          <p style={{ color: '#0366d6', fontWeight: '500' }}>
            Inyectando referencias en base de datos...
          </p>
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

        {isSuccess && (
          <div style={styles.successBox}>
            <p style={styles.successTitle}>
              ¡Ingesta completada con éxito!
            </p>
            <p style={{ margin: '4px 0' }}>
              Proyecto:{' '}
              <strong>{projectCode}</strong>
            </p>
            <p style={{ margin: '4px 0' }}>
              Total de artículos registrados:{' '}
              <strong>{insertedCount}</strong>
            </p>
            <span style={styles.badge}>Persistido en DB</span>
            <ReferencesDataTable
              data={[
                {
                  id: 1,
                  title: `Artículos asociados a ${projectCode}`,
                  author: 'Verificado',
                  year: new Date().getFullYear(),
                  journal: 'Repositorio Local',
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferencesView;
