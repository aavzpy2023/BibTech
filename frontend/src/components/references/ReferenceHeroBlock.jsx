import React from 'react';
import PropTypes from 'prop-types';

export default function ReferenceHeroBlock({
  title,
  authors,
  year,
  journal,
  volume,
  issue,
  pages,
  doi,
  onCopyDoi,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '20px',
        marginBottom: '20px',
      }}
    >
      <h2
        style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#f8fafc',
          margin: 0,
          lineHeight: '1.3',
        }}
      >
        {title || 'Untitled'}
      </h2>

      <div style={{ fontSize: '14px', color: '#94a3b8' }}>
        {authors || 'N/A'}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '20px',
          fontSize: '13px',
          color: '#cbd5e1',
          marginTop: '6px',
        }}
      >
        {/* Year */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0, color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ fontWeight: '600', color: '#f1f5f9' }}>{year || '—'}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Year</span>
        </div>

        <div style={{ width: '1px', height: '28px', backgroundColor: '#1e293b' }}></div>

        {/* Journal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0, color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span style={{ fontWeight: '600', color: '#f1f5f9', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={journal}>
              {journal || '—'}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Journal</span>
        </div>

        <div style={{ width: '1px', height: '28px', backgroundColor: '#1e293b' }}></div>

        {/* Volume & Issue */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0, color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span style={{ fontWeight: '600', color: '#f1f5f9' }}>{volume ? `Vol. ${volume}` : '—'}</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Volume</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '20px' }}>
              <span style={{ fontWeight: '600', color: '#f1f5f9' }}>{issue ? `Issue ${issue}` : '—'}</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Issue</span>
          </div>
        </div>

        <div style={{ width: '1px', height: '28px', backgroundColor: '#1e293b' }}></div>

        {/* Pages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0, color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span style={{ fontWeight: '600', color: '#f1f5f9' }}>{pages ? `pp. ${pages}` : '—'}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Pages</span>
        </div>

        <div style={{ width: '1px', height: '28px', backgroundColor: '#1e293b' }}></div>

        {/* DOI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '20px' }}>
            <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0, color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {doi ? (
              <button 
                onClick={() => onCopyDoi(doi)}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                aria-label={`Copy DOI: ${doi}`}
              >
                {doi}
                <svg width="12" height="12" style={{ width: '12px', height: '12px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            ) : (
              <span style={{ fontWeight: '600', color: '#f1f5f9' }}>—</span>
            )}
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>DOI</span>
        </div>
      </div>
    </div>
  );
}

ReferenceHeroBlock.propTypes = {
  title: PropTypes.string,
  authors: PropTypes.string,
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  journal: PropTypes.string,
  volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  issue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pages: PropTypes.string,
  doi: PropTypes.string,
  onCopyDoi: PropTypes.func.isRequired,
};