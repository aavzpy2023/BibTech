import React from 'react';
import PropTypes from 'prop-types';
import ModalTemplate from '../common/ModalTemplate';
import ReferenceHeroBlock from './ReferenceHeroBlock';
import OverviewLeftColumn from './OverviewLeftColumn';
import OverviewRightColumn from './OverviewRightColumn';
import MetricsFooterCards from './MetricsFooterCards';
import ReferenceDrawer from './ReferenceDrawer';
import useReferenceDetails from '../../hooks/useReferenceDetails';

export default function ReferenceDetailsModal({ isOpen, onClose, article }) {
  const {
    activeTab,
    handleTabChange,
    drawerState,
    handleExpandDrawer,
    closeDrawer,
    handleHoverInfo,
    handleCopy,
    isAbstractExpanded,
    toggleAbstractExpanded,
    title,
    authors,
    year,
    journal,
    volume,
    issue,
    pages,
    doi,
    abstract,
    authorKeywords,
    plusKeywords,
    researchAreas,
    wosCategories,
    affiliations,
    authorsDetailsCount,
    authorEmail,
    orcidCount,
    researcherIdCount,
    fundingText,
    fundingList,
    type,
    language,
    issn,
    month,
    articleNumber,
    publisher,
    address,
    timesCited,
    oaStatus,
    referencesList,
    authorsDetail,
  } = useReferenceDetails(article);

  if (!article) return null;

  const tabs = [
    {
      id: 'Overview',
      label: 'Overview',
      icon: (
        <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'Metadata',
      label: 'Metadata',
      icon: (
        <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'Authors & Institutions',
      label: 'Authors & Institutions',
      icon: (
        <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'References',
      label: 'References',
      icon: (
        <svg width="15" height="15" style={{ width: '15px', height: '15px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            style={{ width: '20px', height: '20px', color: '#60a5fa' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Reference Details</span>
        </div>
      }
      maxWidth="1180px"
    >
      <div style={{ position: 'relative' }}>
        <ReferenceHeroBlock
          title={title}
          authors={authors}
          year={year}
          journal={journal}
          volume={volume}
          issue={issue}
          pages={pages}
          doi={doi}
          onCopyDoi={handleCopy}
        />

        {/* Tabs Header */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #1e293b',
            marginBottom: '24px',
            gap: '24px',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  padding: '0 0 12px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={{ minHeight: '520px' }}>
          {activeTab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: '20px',
              }}
            >
              <OverviewLeftColumn
                abstract={abstract}
                authorKeywords={authorKeywords}
                plusKeywords={plusKeywords}
                researchAreas={researchAreas}
                wosCategories={wosCategories}
                isExpanded={isAbstractExpanded}
                onExpandAbstract={toggleAbstractExpanded}
                onOpenAbstractModal={() =>
                  handleExpandDrawer('abstract', [abstract], 'Full Abstract')
                }
                onHoverInfo={handleHoverInfo}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <OverviewRightColumn
                  affiliations={affiliations}
                authorsDetailsCount={authorsDetailsCount}
                authorEmail={authorEmail}
                orcidCount={orcidCount}
                researcherIdCount={researcherIdCount}
                fundingText={fundingText}
                onHoverInfo={handleHoverInfo}
                onCopy={handleCopy}
                onExpandDrawer={(drawerType) => {
                  if (drawerType === 'authors') {
                    handleExpandDrawer('authors', authorsDetail, 'Authors Details');
                  } else if (drawerType === 'affiliations') {
                    const affilList = affiliations
                      ? affiliations
                          .split(';')
                          .map((a) => a.trim())
                          .filter(Boolean)
                      : [];
                    handleExpandDrawer(
                      'affiliations',
                      affilList,
                      'Affiliations'
                    );
                  } else if (drawerType === 'funding') {
                    const fundingData =
                      fundingList && fundingList.length > 0
                        ? fundingList
                        : fundingText
                        ? [fundingText]
                        : [];
                    handleExpandDrawer(
                      'funding',
                      fundingData,
                      'Funding Acknowledgments'
                    );
                  } else {
                    handleExpandDrawer(drawerType);
                  }
                }}
              />
              <MetricsFooterCards
              type={type}
              language={language}
              issn={issn}
              month={month}
              articleNumber={articleNumber}
              pages={pages}
              publisher={publisher}
              address={address}
              timesCited={timesCited}
              oaStatus={oaStatus}
              onHoverInfo={handleHoverInfo}
            />
          </div>
        </div>

            {referencesList && referencesList.length > 0 && (
              <div
                style={{
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#131d31',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <svg
                    style={{ width: '20px', height: '20px', color: '#94a3b8' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>
                      Cited References
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {referencesList.length} references
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleTabChange('References')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                >
                  View all references &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Metadata' && (
          <div
            style={{
              backgroundColor: '#0C1427',
              border: '1px solid #18243c',
              borderRadius: '8px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px 24px',
            }}
          >
            {[
              { label: 'DOI', val: doi },
              { label: 'Journal', val: journal },
              { label: 'Journal ISO', val: article?.journal_iso },
              { label: 'Publisher', val: publisher },
              { label: 'ISSN / EISSN', val: issn },
              { label: 'Language', val: language },
              { label: 'Document Type', val: type },
              { label: 'OA Status', val: oaStatus },
              {
                label: 'Times Cited',
                val: timesCited != null ? String(timesCited) : null,
              },
              { label: 'WoS Categories', val: wosCategories },
              { label: 'Research Areas', val: researchAreas },
              {
                label: 'Database ID',
                val: article?.id ? String(article.id) : null,
              },
              { label: 'Status', val: article?.project_status },
              { label: 'Created At', val: article?.created_at },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: '600',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#e2e8f0',
                    fontWeight: '500',
                    wordBreak: 'break-all',
                  }}
                >
                  {item.val || '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Authors & Institutions' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '12px',
              alignContent: 'start',
            }}
          >
            {authorsDetail && authorsDetail.length > 0 ? (
              authorsDetail.map((author, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#0C1427',
                    border: '1px solid #18243c',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        fontSize: '14px',
                        color: '#f1f5f9',
                      }}
                    >
                      {author.name || 'Unknown Author'}
                    </span>
                    {author.is_corresponding && (
                      <span
                        style={{
                          padding: '2px 8px',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: '600',
                          backgroundColor: 'rgba(30, 58, 138, 0.4)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          borderRadius: '4px',
                        }}
                      >
                        Corresponding
                      </span>
                    )}
                  </div>
                  {author.affiliation && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        lineHeight: '1.5',
                      }}
                    >
                      {author.affiliation}
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '14px',
                      fontSize: '12px',
                      color: '#64748b',
                    }}
                  >
                    {author.email && (
                      <span style={{ color: '#38bdf8' }}>
                        Email: {author.email}
                      </span>
                    )}
                    {author.orcid && (
                      <span style={{ color: '#a78bfa' }}>
                        ORCID: {author.orcid}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
                  <div
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontStyle: 'italic',
                      gridColumn: '1 / -1',
                    }}
                  >
                    No detailed author records available.
                  </div>
            )}
          </div>
        )}

        {activeTab === 'References' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {referencesList && referencesList.length > 0 ? (
              referencesList.map((refItem, idx) => (
                <div
                  key={refItem.id || idx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#0C1427',
                    border: '1px solid #18243c',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '13px',
                      color: '#e2e8f0',
                      lineHeight: '1.4',
                    }}
                  >
                    {refItem.title || refItem.raw_citation || 'Untitled Reference'}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '14px',
                      fontSize: '12px',
                      color: '#94a3b8',
                    }}
                  >
                    {refItem.year && <span>Year: {refItem.year}</span>}
                    {refItem.doi && (
                      <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>
                        DOI: {refItem.doi}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontStyle: 'italic',
                }}
              >
                No cited references catalogued.
              </div>
            )}
          </div>
        )}
        </div>

        {/* Slide-out Drawer */}
        <ReferenceDrawer
          isOpen={drawerState.isOpen}
          onClose={closeDrawer}
          title={drawerState.title}
          type={drawerState.type}
          data={drawerState.data}
        />
      </div>
    </ModalTemplate>
  );
}

ReferenceDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  article: PropTypes.object,
};