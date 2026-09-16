import React from 'react';
import PropTypes from 'prop-types';

export default function ReferenceDrawer({
  isOpen,
  onClose,
  title,
  type = 'references',
  data = [],
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '480px',
        maxWidth: '100%',
        backgroundColor: '#0b1120',
        borderLeft: '1px solid #1e293b',
        boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.6)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      className={isOpen ? 'translate-x-0' : 'translate-x-full'}
      role="complementary"
      aria-label={title || 'Detail Drawer'}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-100">
            {title || 'Details'}
          </h3>
          {data && data.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-800 text-gray-400 rounded-full">
              {data.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          aria-label="Close drawer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
        {!data || data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm italic">
            No items available
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={item.id || index}
              data-testid="drawer-item"
              className="p-4 rounded-lg bg-gray-900/50 border border-gray-800/80 hover:border-gray-700 transition-colors text-sm"
            >
              {type === 'references' && (
                <div className="flex flex-col gap-1.5">
                  <div className="font-medium text-gray-200 leading-snug">
                    {item.title || item.raw_citation || 'Untitled Reference'}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {item.year && <span>Year: {item.year}</span>}
                    {item.doi && (
                      <span className="text-blue-400 font-mono truncate max-w-[200px]">
                        DOI: {item.doi}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {type === 'authors' && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">
                      {item.name || 'Unknown Author'}
                    </span>
                    {item.is_corresponding && (
                      <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-blue-900/40 text-blue-400 border border-blue-800/60 rounded">
                        Corresponding
                      </span>
                    )}
                  </div>
                  {item.affiliation && (
                    <div className="text-xs text-gray-400">
                      {item.affiliation}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    {item.email && <span>Email: {item.email}</span>}
                    {item.orcid && <span>ORCID: {item.orcid}</span>}
                  </div>
                </div>
              )}

              {type === 'funding' && (
                <div className="flex flex-col gap-1">
                  <div className="font-medium text-gray-200">
                    {item.agency || 'Funding Agency'}
                  </div>
                  {item.grant_number && (
                    <div className="text-xs text-gray-400">
                      Grant:{' '}
                      <span className="font-mono text-gray-300">
                        {item.grant_number}
                      </span>
                    </div>
                  )}
                  {item.country && (
                    <div className="text-xs text-gray-500">{item.country}</div>
                  )}
                </div>
              )}

              {type !== 'references' &&
                type !== 'authors' &&
                type !== 'funding' && (
                  <div className="text-gray-300">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </div>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

ReferenceDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  type: PropTypes.oneOf(['references', 'authors', 'funding', 'generic']),
  data: PropTypes.array,
};