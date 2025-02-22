import React, { useEffect, useCallback } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500 border-red-700 text-white';
      case 'success':
        return 'bg-green-500 border-green-700 text-white';
      case 'warning':
        return 'bg-yellow-500 border-yellow-700 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-700 text-white';
      default:
        return 'bg-gray-500 border-gray-700 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        ${getStyles()}
        min-w-[300px] max-w-[500px]
        px-6 py-3 rounded-md shadow-lg
        border-l-4
        animate-slide-in
        flex items-center justify-between
        transition-all duration-300 ease-in-out
        hover:shadow-xl
      `}
    >
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
        aria-label="Close notification"
      >
        <span aria-hidden="true" className="text-xl">×</span>
      </button>
    </div>
  );
};

export default Toast;
