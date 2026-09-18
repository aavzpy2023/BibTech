import React from 'react';
import PropTypes from 'prop-types';

const SectionCard = ({ title, icon, onHoverInfo, infoKey, rightElement, children }) => (
  <div
    style={{
      backgroundColor: '#0C1427',
      border: '1px solid #18243c',
      borderRadius: '8px',
      padding: '14px 16px',
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {title}
          {onHoverInfo && (
            <button 
              onMouseEnter={(e) => onHoverInfo(infoKey, e)}
              onMouseLeave={() => onHoverInfo(null, null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={`info-${infoKey}`}
            >
              <svg 
                width="14"
                height="14"
                style={{ width: '14px', height: '14px', flexShrink: 0 }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </button>
          )}
        </h3>
      </div>
      {rightElement || (
        <svg
          width="14"
          height="14"
          style={{ width: '14px', height: '14px', color: '#475569', flexShrink: 0 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
    <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
      {children}
    </div>
  </div>
);

SectionCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  onHoverInfo: PropTypes.func,
  infoKey: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default function OverviewLeftColumn({
  abstract,
  authorKeywords,
  plusKeywords,
  researchAreas,
  wosCategories,
  isExpanded = false,
  onExpandAbstract,
  onOpenAbstractModal,
  onHoverInfo,
}) {
  const renderChips = (items) => {
    if (!items || items.length === 0) {
      return <span style={{ color: '#64748b', fontStyle: 'italic' }}>None provided</span>;
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {items.map((item, idx) => (
          <span 
            key={idx}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#cbd5e1',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  const renderBox = (text) => {
    if (!text) {
      return (
        <span style={{ color: '#64748b', fontStyle: 'italic' }}>
          None provided
        </span>
      );
    }
    return (
      <div
        style={{
          fontSize: '13px',
          color: '#94a3b8',
          lineHeight: '1.5',
          wordBreak: 'break-word',
        }}
      >
        {text}
      </div>
    );
  };

  const docIcon = (
    <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  
  const tagIcon = (
    <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  const linkIcon = (
    <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );

  const globeIcon = (
    <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );

  const filterIcon = (
    <svg width="18" height="18" style={{ width: '18px', height: '18px', flexShrink: 0, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );

  const abstractRight = (
    <div
      onClick={onOpenAbstractModal || onExpandAbstract}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
      }}
      title="Open full abstract dialog"
    >
      <svg
        width="15"
        height="15"
        style={{ width: '15px', height: '15px', color: '#38bdf8', flexShrink: 0 }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <svg
        width="14"
        height="14"
        style={{ width: '14px', height: '14px', color: '#475569', flexShrink: 0 }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SectionCard 
        title="Abstract" 
        icon={docIcon} 
        onHoverInfo={onHoverInfo} 
        infoKey="abstract"
        rightElement={abstractRight}
      >
        <div style={{ position: 'relative' }}>
          <p
            style={{
              margin: 0,
              color: '#cbd5e1',
              lineHeight: '1.5',
              wordBreak: 'break-word',
              ...(isExpanded
                ? { display: 'block', maxHeight: 'none' }
                : {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }),
            }}
          >
            {abstract || 'No abstract available.'}
          </p>
          {abstract && abstract.length > 200 && (
            <button 
              onClick={onExpandAbstract}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '8px',
                padding: 0,
              }}
            >
              {isExpanded ? 'Show less' : 'View full abstract'}
              <svg width="14" height="14" style={{ width: '14px', height: '14px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M17 8l4 4m0 0l-4 4m4-4H3"} />
              </svg>
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard 
        title="Keywords" 
        icon={tagIcon} 
        onHoverInfo={onHoverInfo} 
        infoKey="keywords"
      >
        {renderChips(authorKeywords)}
      </SectionCard>

      <SectionCard 
        title="Keywords-Plus" 
        icon={linkIcon} 
        onHoverInfo={onHoverInfo} 
        infoKey="keywords-plus"
      >
        {renderChips(plusKeywords)}
      </SectionCard>
    </div>
  );
}

OverviewLeftColumn.propTypes = {
  abstract: PropTypes.string,
  authorKeywords: PropTypes.arrayOf(PropTypes.string),
  plusKeywords: PropTypes.arrayOf(PropTypes.string),
  researchAreas: PropTypes.string,
  wosCategories: PropTypes.string,
  isExpanded: PropTypes.bool,
  onExpandAbstract: PropTypes.func,
  onOpenAbstractModal: PropTypes.func,
  onHoverInfo: PropTypes.func,
};