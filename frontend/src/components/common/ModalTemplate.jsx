import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default function ModalTemplate({
  isOpen,
  onClose,
  header,
  footer,
  children,
  maxWidth = 'max-w-7xl', // 1280px equivalent
}) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-[6px]" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Window */}
      <div 
        className={`relative w-full ${maxWidth} max-h-[90vh] bg-[#0F172A] rounded-xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="text-xl font-semibold text-gray-100 flex items-center gap-3">
            {header}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

ModalTemplate.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};