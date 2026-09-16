import PropTypes from 'prop-types';

const SectionCard = ({ title, icon, onHoverInfo, infoKey, children }) => (
  <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/40">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          {title}
          {onHoverInfo && (
            <button 
              onMouseEnter={(e) => onHoverInfo(infoKey, e)}
              onMouseLeave={() => onHoverInfo(null, null)}
              className="text-gray-500 hover:text-gray-300 focus:outline-none"
              aria-label={`info-${infoKey}`}
            >
              <svg 
                className="w-4 h-4" 
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
    </div>
    <div className="text-sm text-gray-300">
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
  onExpandAbstract,
  onHoverInfo,
}) {
  const renderChips = (items) => {
    if (!items || items.length === 0) {
      return <span className="text-gray-500 italic">None provided</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span 
            key={idx}
            className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-full text-xs font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  const renderBox = (text) => {
    if (!text) return <span className="text-gray-500 italic">None provided</span>;
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded p-2 text-xs text-gray-300 break-words">
        {text}
      </div>
    );
  };

  const docIcon = (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
  
  const tagIcon = (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );

  const linkIcon = (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );

  const globeIcon = (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );

  const filterIcon = (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-4">
      <SectionCard 
        title="Abstract" 
        icon={docIcon} 
        onHoverInfo={onHoverInfo} 
        infoKey="abstract"
      >
        <div className="relative">
          <p className="line-clamp-4 text-gray-300 leading-relaxed break-words">
            {abstract || 'No abstract available.'}
          </p>
          {abstract && abstract.length > 200 && (
            <button 
              onClick={onExpandAbstract}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-2"
            >
              View full abstract
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

      <SectionCard 
        title="Research Areas" 
        icon={globeIcon} 
        onHoverInfo={onHoverInfo} 
        infoKey="research-areas"
      >
        {renderBox(researchAreas)}
      </SectionCard>

      <SectionCard 
        title="Web of Science Categories" 
        icon={filterIcon} 
        onHoverInfo={onHoverInfo} 
        infoKey="wos-categories"
      >
        {renderBox(wosCategories)}
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
  onExpandAbstract: PropTypes.func,
  onHoverInfo: PropTypes.func,
};