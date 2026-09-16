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
    { id: 'Overview', label: 'Overview' },
    { id: 'Metadata', label: 'Metadata' },
    { id: 'Authors & Institutions', label: 'Authors & Institutions' },
    { id: 'References', label: 'References' },
  ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      header={
        <div className="flex items-center gap-2 text-gray-200">
          <svg
            className="w-5 h-5 text-blue-400"
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
      maxWidth="max-w-6xl"
    >
      <div className="relative">
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
        <div className="flex border-b border-gray-800 mb-6 gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OverviewLeftColumn
                abstract={abstract}
                authorKeywords={authorKeywords}
                plusKeywords={plusKeywords}
                researchAreas={researchAreas}
                wosCategories={wosCategories}
                onExpandAbstract={toggleAbstractExpanded}
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
                onExpandDrawer={(drawerType) =>
                  handleExpandDrawer(
                    drawerType,
                    drawerType === 'authors' ? authorsDetail : null
                  )
                }
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
              <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/40 flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                    <h4 className="text-sm font-semibold text-gray-200">
                      Cited References
                    </h4>
                    <span className="text-xs text-gray-500">
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
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
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