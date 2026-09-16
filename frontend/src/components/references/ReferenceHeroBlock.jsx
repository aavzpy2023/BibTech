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
    <div className="flex flex-col gap-4 border-b border-gray-800 pb-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-100 leading-snug">
        {title || 'Untitled'}
      </h2>

      <div className="text-sm text-gray-400">
        {authors || 'N/A'}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mt-2">
        {/* Year */}
        <div className="flex flex-col gap-1 min-w-[80px]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-gray-100">{year || '—'}</span>
          </div>
          <span className="text-xs text-gray-500">Year</span>
        </div>

        <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>

        {/* Journal */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium text-gray-100 truncate max-w-[200px]" title={journal}>
              {journal || '—'}
            </span>
          </div>
          <span className="text-xs text-gray-500">Journal</span>
        </div>

        <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>

        {/* Volume & Issue */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 min-w-[60px]">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium text-gray-100">{volume ? `Vol. ${volume}` : '—'}</span>
            </div>
            <span className="text-xs text-gray-500">Volume</span>
          </div>
          
          <div className="flex flex-col gap-1 min-w-[60px]">
            <div className="flex items-center h-5">
              <span className="font-medium text-gray-100 pl-6">{issue ? `Issue ${issue}` : '—'}</span>
            </div>
            <span className="text-xs text-gray-500 pl-6">Issue</span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>

        {/* Pages */}
        <div className="flex flex-col gap-1 min-w-[80px]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-gray-100">{pages ? `pp. ${pages}` : '—'}</span>
          </div>
          <span className="text-xs text-gray-500">Pages</span>
        </div>

        <div className="w-px h-8 bg-gray-800 hidden sm:block"></div>

        {/* DOI */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 h-5">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {doi ? (
              <button 
                onClick={() => onCopyDoi(doi)}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors flex items-center gap-1"
                aria-label={`Copy DOI: ${doi}`}
              >
                {doi}
                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            ) : (
              <span className="font-medium text-gray-100">—</span>
            )}
          </div>
          <span className="text-xs text-gray-500">DOI</span>
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