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
            </div>

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
                  onClick={() =>
                    handleExpandDrawer(
                      'references',
                      referencesList,
                      'Cited References'
                    )
                  }
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
          <div className="p-6 text-gray-400 text-sm italic border border-gray-800 rounded-lg bg-gray-900/30">
            Raw metadata attributes and database verification panel.
          </div>
        )}

        {activeTab === 'Authors & Institutions' && (
          <div className="p-6 text-gray-400 text-sm italic border border-gray-800 rounded-lg bg-gray-900/30">
            {authorsDetailsCount > 0
              ? `${authorsDetailsCount} mapped author records with verified institutional affiliations.`
              : 'No detailed author records available.'}
          </div>
        )}

        {activeTab === 'References' && (
          <div className="p-6 text-gray-400 text-sm italic border border-gray-800 rounded-lg bg-gray-900/30">
            {referencesList && referencesList.length > 0
              ? `${referencesList.length} cited references catalogued.`
              : 'No cited references available.'}
          </div>
        )}

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