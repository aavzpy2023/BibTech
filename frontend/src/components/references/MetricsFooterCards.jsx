import React from 'react';
import PropTypes from 'prop-types';

export default function MetricsFooterCards({
  type,
  language,
  issn,
  month,
  articleNumber,
  pages,
  publisher,
  address,
  timesCited,
  oaStatus,
  onHoverInfo,
}) {
  const getOABadgeClass = (status) => {
    if (!status) return 'bg-gray-800 text-gray-400';
    const s = status.toLowerCase();
    if (s.includes('gold')) return 'bg-green-900/30 text-green-400 border-green-800/50';
    if (s.includes('green')) return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
    if (s.includes('bronze')) return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
    return 'bg-gray-800 text-gray-300 border-gray-700';
  };

  const PropRow = ({ label, value }) => (
    <div style={{ display: 'flex', fontSize: '13px', alignItems: 'center' }}>
      <span style={{ width: '130px', color: '#64748b', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#cbd5e1', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
    </div>
  );

  PropRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  const iconInfo = (
    <svg width="14" height="14" style={{ width: '14px', height: '14px', flexShrink: 0, color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '16px',
        marginTop: '0px',
      }}
    >
      {/* Bibliographic Card */}
      <div style={{ backgroundColor: '#0C1427', border: '1px solid #18243c', borderRadius: '8px', padding: '14px 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bibliographic Information
            {onHoverInfo && (
              <button 
                onMouseEnter={(e) => onHoverInfo('biblio-info', e)}
                onMouseLeave={() => onHoverInfo(null, null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="info-biblio"
              >
                {iconInfo}
              </button>
            )}
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PropRow label="Type" value={type} />
            <PropRow label="Language" value={language} />
            <PropRow label="ISSN / EISSN" value={issn} />
            <PropRow label="Month" value={month} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <PropRow label="Article Number" value={articleNumber} />
            <PropRow label="Pages" value={pages} />
            <PropRow label="Publisher" value={publisher} />
            <PropRow label="Address" value={address} />
          </div>
        </div>
      </div>

      {/* Metrics Card */}
      <div style={{ backgroundColor: '#0C1427', border: '1px solid #18243c', borderRadius: '8px', padding: '14px 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Database & Metrics
            {onHoverInfo && (
              <button 
                onMouseEnter={(e) => onHoverInfo('metrics-info', e)}
                onMouseLeave={() => onHoverInfo(null, null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="info-metrics"
              >
                {iconInfo}
              </button>
            )}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <PropRow label="Times Cited" value={timesCited} />
          
          <div style={{ display: 'flex', fontSize: '13px', alignItems: 'center' }}>
            <span style={{ width: '130px', color: '#64748b', flexShrink: 0 }}>OA</span>
            {oaStatus ? (
              <span className={`px-2 py-0.5 rounded text-xs border font-medium ${getOABadgeClass(oaStatus)}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                {oaStatus}
              </span>
            ) : (
              <span style={{ color: '#cbd5e1', fontWeight: '500' }}>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

MetricsFooterCards.propTypes = {
  type: PropTypes.string,
  language: PropTypes.string,
  issn: PropTypes.string,
  month: PropTypes.string,
  articleNumber: PropTypes.string,
  pages: PropTypes.string,
  publisher: PropTypes.string,
  address: PropTypes.string,
  timesCited: PropTypes.number,
  oaStatus: PropTypes.string,
  onHoverInfo: PropTypes.func,
};