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
    <div className="flex text-sm">
      <span className="w-32 text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-300 font-medium truncate">{value || '—'}</span>
    </div>
  );

  PropRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  const iconInfo = (
    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Bibliographic Card */}
      <div className="border border-gray-800 rounded-lg p-5 bg-gray-900/40">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-gray-200 flex items-center gap-2">
            Bibliographic Information
            {onHoverInfo && (
              <button 
                onMouseEnter={(e) => onHoverInfo('biblio-info', e)}
                onMouseLeave={() => onHoverInfo(null, null)}
                className="focus:outline-none"
                aria-label="info-biblio"
              >
                {iconInfo}
              </button>
            )}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="flex flex-col gap-3">
            <PropRow label="Type" value={type} />
            <PropRow label="Language" value={language} />
            <PropRow label="ISSN / EISSN" value={issn} />
            <PropRow label="Month" value={month} />
          </div>
          <div className="flex flex-col gap-3">
            <PropRow label="Article Number" value={articleNumber} />
            <PropRow label="Pages" value={pages} />
            <PropRow label="Publisher" value={publisher} />
            <PropRow label="Address" value={address} />
          </div>
        </div>
      </div>

      {/* Metrics Card */}
      <div className="border border-gray-800 rounded-lg p-5 bg-gray-900/40">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-gray-200 flex items-center gap-2">
            Database & Metrics
            {onHoverInfo && (
              <button 
                onMouseEnter={(e) => onHoverInfo('metrics-info', e)}
                onMouseLeave={() => onHoverInfo(null, null)}
                className="focus:outline-none"
                aria-label="info-metrics"
              >
                {iconInfo}
              </button>
            )}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <PropRow label="Times Cited" value={timesCited} />
          
          <div className="flex text-sm items-center">
            <span className="w-48 text-gray-500 shrink-0">OA</span>
            {oaStatus ? (
              <span className={`px-2 py-0.5 rounded text-xs border font-medium ${getOABadgeClass(oaStatus)}`}>
                {oaStatus}
              </span>
            ) : (
              <span className="text-gray-300 font-medium">—</span>
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