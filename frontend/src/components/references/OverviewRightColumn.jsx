import React from 'react';
import PropTypes from 'prop-types';

const RightPanelBox = ({ title, icon, onHoverInfo, infoKey, onClick, children, copyAction }) => (
  <div 
    style={{
      backgroundColor: '#0C1427',
      border: '1px solid #18243c',
      borderRadius: '8px',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: onClick ? 'pointer' : 'default',
      boxSizing: 'border-box',
    }}
    onClick={onClick}
    role={onClick ? 'button' : 'region'}
    aria-label={onClick ? `Open ${title.toLowerCase()} list` : undefined}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, overflow: 'hidden' }}>
      <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {title}
          {onHoverInfo && (
            <button 
              onMouseEnter={(e) => {
                if(e.stopPropagation) e.stopPropagation();
                onHoverInfo(infoKey, e);
              }}
              onMouseLeave={(e) => {
                if(e.stopPropagation) e.stopPropagation();
                onHoverInfo(null, null);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              aria-label={`info-${infoKey}`}
            >
              <svg width="14" height="14" style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </h3>
        <div style={{ fontSize: '13px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {children || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>None provided</span>}
        </div>
      </div>
    </div>
    
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
        {copyAction && children && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyAction(children);
            }}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            aria-label="copy email"
          >
            <svg width="16" height="16" style={{ width: '16px', height: '16px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        {onClick && (
          <svg
            width="14"
            height="14"
            style={{ width: '14px', height: '14px', flexShrink: 0, color: '#475569' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
  </div>
);

RightPanelBox.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  onHoverInfo: PropTypes.func,
  infoKey: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  copyAction: PropTypes.func,
};

export default function OverviewRightColumn({
  affiliations,
  authorsDetailsCount,
  authorEmail,
  orcidCount,
  researcherIdCount,
  fundingText,
  onHoverInfo,
  onCopy,
  onExpandDrawer,
}) {
  const icons = {
    building: <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    users: <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    mail: <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    badge: <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg>,
    globe: <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    cash: <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <RightPanelBox 
        title="Affiliations" 
        icon={icons.building} 
        onHoverInfo={onHoverInfo} 
        infoKey="affiliations"
        onClick={affiliations ? () => onExpandDrawer('affiliations') : null}
      >
        {affiliations}
      </RightPanelBox>

      <RightPanelBox 
        title="Authors Details" 
        icon={icons.users} 
        onHoverInfo={onHoverInfo} 
        infoKey="authors"
        onClick={authorsDetailsCount > 0 ? () => onExpandDrawer('authors') : null}
      >
        {authorsDetailsCount ? `${authorsDetailsCount} authors (see full list)` : null}
      </RightPanelBox>

      <RightPanelBox 
        title="Author Email" 
        icon={icons.mail} 
        onHoverInfo={onHoverInfo} 
        infoKey="email"
        copyAction={onCopy}
      >
        {authorEmail}
      </RightPanelBox>

      <RightPanelBox 
        title="ORCID Numbers" 
        icon={icons.badge} 
        onHoverInfo={onHoverInfo} 
        infoKey="orcid"
      >
        {orcidCount ? `${orcidCount} ORCID IDs` : null}
      </RightPanelBox>

      <RightPanelBox 
        title="ResearcherID Numbers" 
        icon={icons.globe} 
        onHoverInfo={onHoverInfo} 
        infoKey="researcher-id"
      >
        {researcherIdCount ? `${researcherIdCount} Researcher IDs` : null}
      </RightPanelBox>

      <RightPanelBox 
        title="Funding" 
        icon={icons.cash} 
        onHoverInfo={onHoverInfo} 
        infoKey="funding"
        onClick={fundingText ? () => onExpandDrawer('funding') : null}
      >
        {fundingText}
      </RightPanelBox>
    </div>
  );
}

OverviewRightColumn.propTypes = {
  affiliations: PropTypes.string,
  authorsDetailsCount: PropTypes.number,
  authorEmail: PropTypes.string,
  orcidCount: PropTypes.number,
  researcherIdCount: PropTypes.number,
  fundingText: PropTypes.string,
  onHoverInfo: PropTypes.func,
  onCopy: PropTypes.func,
  onExpandDrawer: PropTypes.func,
};